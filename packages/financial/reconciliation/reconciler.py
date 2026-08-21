import uuid
from datetime import datetime
from typing import List, Optional
from packages.data.schemas.transaction import Transaction, TransactionDirection
from packages.data.schemas.email import EmailEvidence
from packages.data.schemas.alert import Alert, AlertStatus, AlertType
from packages.evidence.confidence import compute_transaction_email_confidence, get_confidence_label
from packages.financial.reconciliation.payout_radar import PayoutRadar


class ReconciliationEngine:
    """
    Cross-source Financial Reconciliation Engine:
    - Account ↔ Wallet Transfers
    - Email Payout Confirmations ↔ Bank/Wallet Received Deposits (PayoutRadar)
    - Card Transactions ↔ Email Receipts
    """

    @staticmethod
    def reconcile_sources(
        account_txs: List[Transaction],
        wallet_txs: List[Transaction],
        card_txs: List[Transaction],
        emails: Optional[List[EmailEvidence]] = None,
        current_time: Optional[datetime] = None,
    ) -> List[Alert]:
        alerts: List[Alert] = []
        emails = emails or []

        # 1. Payout Confirmation ↔ Received Deposits (PayoutRadar)
        payout_alerts = PayoutRadar.detect_overdue_payouts(
            payout_emails=emails,
            account_txs=account_txs + wallet_txs,
            current_time=current_time,
        )
        alerts.extend(payout_alerts)

        # 2. Account ↔ Wallet Reconciliation
        # Check debit transfers from account to wallet that lack a corresponding credit in wallet
        for acc_tx in account_txs:
            if "wallet" in (acc_tx.merchant_normalized or acc_tx.merchant_raw).lower() and acc_tx.direction == TransactionDirection.DEBIT:
                matched = False
                for w_tx in wallet_txs:
                    if abs(w_tx.amount - acc_tx.amount) < 0.01 and abs((w_tx.occurred_at - acc_tx.occurred_at).days) <= 2:
                        matched = True
                        break

                if not matched:
                    confidence = 0.92
                    alerts.append(
                        Alert(
                            id=f"alt_rec_wal_{uuid.uuid4().hex[:8]}",
                            alert_type=AlertType.UNRECONCILED,
                            title=f"Lệch đối soát Account ↔ Wallet: ${acc_tx.amount:,.2f}",
                            status=AlertStatus.NEEDS_USER_CONFIRMATION,
                            reason=f"Khoản nạp ${acc_tx.amount:,.2f} đã rời tài khoản ngân hàng nhưng chưa ghi nhận cộng tiền trong Wallet.",
                            confidence=confidence,
                            confidence_label=get_confidence_label(confidence),
                            deadline_days=60,
                            amount=acc_tx.amount,
                            transaction_ids=[acc_tx.id],
                            evidence_ids=[f"ev_tx_{acc_tx.id}"],
                            created_at=datetime.utcnow(),
                        )
                    )

        # 3. Card ↔ Email Verification
        for c_tx in card_txs:
            # Look for matching email receipt
            matched_email = None
            best_score = 0.0
            for em in emails:
                score, _ = compute_transaction_email_confidence(c_tx, em)
                if score > best_score:
                    best_score = score
                    matched_email = em

            # If high value transaction has NO matching email receipt and unknown merchant
            if best_score < 0.30 and c_tx.amount >= 50.0 and c_tx.transaction_type != TransactionType.AD_SPEND:
                alerts.append(
                    Alert(
                        id=f"alt_rec_em_{uuid.uuid4().hex[:8]}",
                        alert_type=AlertType.UNKNOWN_FEE,
                        title=f"Chưa có hoá đơn/email: {c_tx.merchant_normalized} (${c_tx.amount:,.2f})",
                        status=AlertStatus.INSUFFICIENT_DATA,
                        reason=f"Giao dịch thẻ ${c_tx.amount:,.2f} tại {c_tx.merchant_normalized} không tìm thấy email biên lai hoặc thông báo đối chiếu tương ứng.",
                        confidence=0.45,
                        confidence_label=get_confidence_label(0.45),
                        deadline_days=60,
                        amount=c_tx.amount,
                        transaction_ids=[c_tx.id],
                        evidence_ids=[f"ev_tx_{c_tx.id}"],
                        created_at=datetime.utcnow(),
                    )
                )

        return alerts
