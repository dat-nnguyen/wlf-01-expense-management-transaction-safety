import uuid
from datetime import datetime, timedelta
from typing import List, Tuple
from packages.data.schemas.transaction import Transaction
from packages.data.schemas.alert import Alert, AlertStatus, AlertType
from packages.evidence.confidence import get_confidence_label


class DuplicateDetector:
    """
    Detects potential duplicate charges:
    - Same amount
    - Same or very similar merchant
    - Timestamp within 48 hours
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
                if tx1.amount <= 0 or tx2.amount <= 0:
                    continue

                # Same amount
                if abs(tx1.amount - tx2.amount) > 0.001:
                    continue

                # Same merchant (normalized)
                m1 = (tx1.merchant_normalized or tx1.merchant_raw).lower()
                m2 = (tx2.merchant_normalized or tx2.merchant_raw).lower()
                if m1 != m2 and (m1 not in m2 and m2 not in m1):
                    continue

                # Within time window
                time_diff = abs(tx1.occurred_at - tx2.occurred_at)
                if time_diff <= timedelta(hours=time_window_hours):
                    # Deterministic confidence based on time proximity
                    if time_diff <= timedelta(minutes=10):
                        confidence = 0.96
                    elif time_diff <= timedelta(hours=6):
                        confidence = 0.90
                    else:
                        confidence = 0.75

                    alert = Alert(
                        id=f"alt_dup_{uuid.uuid4().hex[:8]}",
                        alert_type=AlertType.DUPLICATE,
                        title=f"Nghi vấn trùng lặp: {tx1.merchant_normalized} (${tx1.amount})",
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        reason=f"Phát hiện 2 giao dịch cùng số tiền ${tx1.amount:.2f} tại {tx1.merchant_normalized} trong vòng {time_diff.total_seconds() / 3600:.1f} giờ.",
                        confidence=confidence,
                        confidence_label=get_confidence_label(confidence),
                        deadline_days=60,
                        transaction_ids=[tx1.id, tx2.id],
                        evidence_ids=[f"ev_tx_{tx1.id}", f"ev_tx_{tx2.id}"],
                        created_at=datetime.utcnow(),
                    )
                    results.append((tx1, tx2, alert))

        return results
