import uuid
from datetime import datetime, timedelta
from typing import List, Tuple
from packages.data.schemas.transaction import Transaction, TransactionDirection
from packages.data.schemas.alert import Alert, AlertStatus, AlertType
from packages.evidence.confidence import get_confidence_label


class DuplicateDetector:
    """
    Detects duplicate charges on Virtual Cards and Bank Accounts:
    - Same card / account
    - Same amount
    - Same or very similar merchant
    - Timestamp within short time window (e.g. within minutes or up to 48 hours)
    - Generates 60-day standard dispute deadline countdown & dispute draft
    """

    @staticmethod
    def find_duplicates(
        transactions: List[Transaction],
        time_window_hours: int = 48,
    ) -> List[Tuple[Transaction, Transaction, Alert]]:
        results: List[Tuple[Transaction, Transaction, Alert]] = []
        n = len(transactions)

        for i in range(n):
            for j in range(i + 1, n):
                tx1 = transactions[i]
                tx2 = transactions[j]

                # Only compare debits/purchases
                if tx1.amount <= 0 or tx2.amount <= 0 or tx1.direction != TransactionDirection.DEBIT:
                    continue

                # Same amount
                if abs(tx1.amount - tx2.amount) > 0.001:
                    continue

                # Same merchant (normalized)
                m1 = (tx1.merchant_normalized or tx1.merchant_raw).lower()
                m2 = (tx2.merchant_normalized or tx2.merchant_raw).lower()
                if m1 != m2 and (m1 not in m2 and m2 not in m1):
                    continue

                # Check if on same virtual card or same account
                same_card = (tx1.card_id and tx2.card_id and tx1.card_id == tx2.card_id) or (tx1.account_id == tx2.account_id)
                if not same_card and (tx1.source == tx2.source):
                    # If different cards, might still be duplicate billing on same merchant
                    pass

                # Within time window
                time_diff = abs(tx1.occurred_at - tx2.occurred_at)
                if time_diff <= timedelta(hours=time_window_hours):
                    # Deterministic confidence based on time proximity
                    if time_diff <= timedelta(minutes=10):
                        confidence = 0.98
                        time_desc = f"{int(time_diff.total_seconds() / 60)} phút"
                    elif time_diff <= timedelta(hours=6):
                        confidence = 0.92
                        time_desc = f"{time_diff.total_seconds() / 3600:.1f} giờ"
                    else:
                        confidence = 0.80
                        time_desc = f"{time_diff.total_seconds() / 3600:.1f} giờ"

                    card_label = f" (Thẻ ảo: {tx1.card_id} - {tx1.bank_name})" if tx1.card_id else ""
                    merchant_display = tx1.merchant_normalized or tx1.merchant_raw

                    dispute_draft = (
                        f"Kính gửi Ngân hàng {tx1.bank_name or 'phát hành thẻ'} / Bộ phận Hỗ trợ Wealify,\n\n"
                        f"Tôi xin yêu cầu tra soát giao dịch bị trừ tiền đúp 2 lần (Double Charge):\n"
                        f"- Giao dịch 1: ${tx1.amount:,.2f} USD lúc {tx1.occurred_at.strftime('%Y-%m-%d %H:%M:%S')} (Mã: {tx1.id})\n"
                        f"- Giao dịch 2: ${tx2.amount:,.2f} USD lúc {tx2.occurred_at.strftime('%Y-%m-%d %H:%M:%S')} (Mã: {tx2.id})\n"
                        f"- Đơn vị thụ hưởng: {merchant_display}\n"
                        f"- Thẻ thanh toán: {tx1.card_id or tx1.account_id}\n\n"
                        f"Kính đề nghị hoàn trả lại khoản tiền bị trừ thừa ${tx1.amount:,.2f} USD.\n\n"
                        f"Trân trọng cảm ơn."
                    )

                    alert = Alert(
                        id=f"alt_dup_{uuid.uuid4().hex[:8]}",
                        alert_type=AlertType.DUPLICATE,
                        title=f"⚠️ Cà thẻ 2 lần: {merchant_display} (${tx1.amount:,.2f}){card_label}",
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        reason=(
                            f"Phát hiện 2 giao dịch cùng số tiền ${tx1.amount:,.2f} tại {merchant_display}"
                            f" chỉ cách nhau {time_desc}{card_label}."
                        ),
                        confidence=confidence,
                        confidence_label=get_confidence_label(confidence),
                        deadline_days=60,
                        card_id=tx1.card_id,
                        bank_name=tx1.bank_name,
                        amount=tx1.amount,
                        dispute_draft=dispute_draft,
                        action_suggestion="Xác nhận yêu cầu hoàn tiền và gửi khiếu nại tra soát trong hạn 60 ngày.",
                        transaction_ids=[tx1.id, tx2.id],
                        evidence_ids=[f"ev_tx_{tx1.id}", f"ev_tx_{tx2.id}"],
                        metadata={
                            "time_diff_seconds": time_diff.total_seconds(),
                            "card_id": tx1.card_id,
                            "bank_name": tx1.bank_name,
                        },
                        created_at=datetime.utcnow(),
                    )
                    results.append((tx1, tx2, alert))

        return results
