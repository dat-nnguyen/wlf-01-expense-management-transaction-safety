import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.data.schemas.transaction import Transaction, TransactionDirection
from packages.data.schemas.alert import Alert, AlertStatus, AlertType
from packages.evidence.confidence import get_confidence_label


class PayoutRadar:
    """
    Cross-Border Seller Payout Radar:
    Detects when e-commerce platforms (Amazon, Stripe, Shopify, TikTok Shop, PayPal, Etsy)
    have confirmed disbursements via email, but funds have NOT arrived in Wealify accounts/wallets
    past the expected settlement window (e.g. 2-3 business days or 14-15+ days overdue).
    """

    @staticmethod
    def detect_overdue_payouts(
        payout_emails: List[EmailEvidence],
        account_txs: List[Transaction],
        current_time: Optional[datetime] = None,
        grace_period_days: int = 3,
    ) -> List[Alert]:
        alerts: List[Alert] = []
        now = current_time or datetime.utcnow()

        # Filter emails that represent seller disbursements / payout confirmations
        seller_emails = [
            em for em in payout_emails
            if em.email_type in [EmailType.PAYOUT_NOTIFICATION, EmailType.TRANSFER_CONFIRMATION]
            or any(k in em.subject.lower() or k in (em.body_snippet or "").lower() 
                   for k in ["disbursement", "payout", "settlement", "initiated a payout", "transfer id"])
        ]

        # All incoming credit transactions in bank or wallet
        credits = [tx for tx in account_txs if tx.direction == TransactionDirection.CREDIT and tx.amount > 0]

        for em in seller_emails:
            if not em.amount or em.amount <= 0:
                continue

            # Check if there is a matching credit in bank or wallet
            matched_tx: Optional[Transaction] = None
            for tx in credits:
                # Match by amount and proximity (after payout date)
                amount_match = abs(tx.amount - em.amount) < 0.01
                # Must occur after or near email date
                is_after_email = tx.occurred_at >= em.date - timedelta(days=1)
                merchant_sim = (
                    em.merchant.lower() in (tx.merchant_normalized or tx.merchant_raw).lower()
                    or any(k in (tx.merchant_normalized or tx.merchant_raw).lower() for k in ["payout", "settlement", "disbursement", "stripe", "amazon", "shopify"])
                )

                if amount_match and is_after_email and merchant_sim:
                    matched_tx = tx
                    break

            if not matched_tx:
                # Calculate elapsed days & overdue status
                elapsed_days = max(0, (now.date() - em.date.date()).days)
                expected_days = em.expected_settlement_days or grace_period_days
                
                # Check if it has exceeded expected SLA
                if elapsed_days >= expected_days:
                    is_critical = elapsed_days >= 14
                    confidence = 0.96 if is_critical else 0.91

                    # Generate dispute letter draft
                    payout_ref_str = f" (Mã đối soát: {em.payout_ref})" if em.payout_ref else ""
                    dispute_draft = (
                        f"Kính gửi bộ phận Hỗ trợ Đối tác {em.merchant},\n\n"
                        f"Hệ thống Wealify ghi nhận thông báo giải ngân thành công khoản tiền ${em.amount:,.2f} USD "
                        f"từ ngày {em.date.strftime('%d/%m/%Y')}{payout_ref_str}.\n"
                        f"Tuy nhiên đến nay đã {elapsed_days} ngày, tài khoản thụ hưởng vẫn chưa ghi nhận số dư này.\n"
                        f"Kính đề nghị Quý đối tác cung cấp mã giao dịch ngân hàng (Bank Reference / ARN / MT103) "
                        f"hoặc kiểm tra lại lệnh giải ngân giúp chúng tôi.\n\n"
                        f"Trân trọng,\nĐội ngũ Tài chính Doanh nghiệp."
                    )

                    alert = Alert(
                        id=f"alt_payout_{uuid.uuid4().hex[:8]}",
                        alert_type=AlertType.OVERDUE_PAYOUT,
                        title=f"⚠️ Bất thường Payout chưa về: {em.merchant} (${em.amount:,.2f})",
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        reason=(
                            f"Email xác nhận giải ngân ${em.amount:,.2f} USD từ {em.merchant} ngày {em.date.strftime('%d/%m/%Y')}"
                            f" nhưng sau {elapsed_days} ngày vẫn chưa thấy tiền về tài khoản Wealify "
                            f"(Quy chuẩn xử lý: {expected_days} ngày)."
                        ),
                        confidence=confidence,
                        confidence_label=get_confidence_label(confidence),
                        deadline_days=60,
                        days_overdue=elapsed_days,
                        amount=em.amount,
                        dispute_draft=dispute_draft,
                        action_suggestion="Gửi ticket tra soát tới sàn và kiểm tra lại thông tin tài khoản thụ hưởng.",
                        transaction_ids=[],
                        evidence_ids=[f"ev_email_{em.id}"],
                        metadata={
                            "email_id": em.id,
                            "payout_ref": em.payout_ref,
                            "email_date": em.date.isoformat(),
                            "elapsed_days": elapsed_days,
                            "severity": "CRITICAL" if is_critical else "WARNING",
                        },
                        created_at=now,
                    )
                    alerts.append(alert)

        return alerts
