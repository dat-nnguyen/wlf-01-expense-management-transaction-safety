import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from collections import defaultdict
from packages.data.schemas.transaction import Transaction
from packages.data.schemas.subscription import Subscription, SubscriptionCadence
from packages.data.schemas.alert import Alert, AlertStatus, AlertType
from packages.evidence.confidence import get_confidence_label


class SubscriptionRadar:
    """
    Detects recurring subscription cadences and identifies price hikes.
    """

    @staticmethod
    def detect_subscriptions(
        transactions: List[Transaction],
    ) -> Tuple[List[Subscription], List[Alert]]:
        # Group by normalized merchant
        grouped: Dict[str, List[Transaction]] = defaultdict(list)
        for tx in sorted(transactions, key=lambda x: x.occurred_at):
            merchant = (tx.merchant_normalized or tx.merchant_raw).strip()
            if merchant and merchant != "Unknown":
                grouped[merchant].append(tx)

        subscriptions: List[Subscription] = []
        alerts: List[Alert] = []

        for merchant, tx_list in grouped.items():
            if len(tx_list) < 2:
                continue

            # Check intervals between consecutive occurrences
            intervals = []
            for i in range(1, len(tx_list)):
                diff_days = (tx_list[i].occurred_at.date() - tx_list[i - 1].occurred_at.date()).days
                intervals.append(diff_days)

            avg_interval = sum(intervals) / len(intervals)

            cadence = None
            if 25 <= avg_interval <= 35:
                cadence = SubscriptionCadence.MONTHLY
                next_date = tx_list[-1].occurred_at + timedelta(days=30)
                annual_mult = 12
            elif 6 <= avg_interval <= 8:
                cadence = SubscriptionCadence.WEEKLY
                next_date = tx_list[-1].occurred_at + timedelta(days=7)
                annual_mult = 52
            elif 350 <= avg_interval <= 380:
                cadence = SubscriptionCadence.YEARLY
                next_date = tx_list[-1].occurred_at + timedelta(days=365)
                annual_mult = 1
            else:
                # If known subscription name, default monthly
                if any(k in merchant.lower() for k in ["netflix", "spotify", "chatgpt", "openai", "adobe", "icloud"]):
                    cadence = SubscriptionCadence.MONTHLY
                    next_date = tx_list[-1].occurred_at + timedelta(days=30)
                    annual_mult = 12

            if not cadence:
                continue

            latest_tx = tx_list[-1]
            prev_tx = tx_list[-2]

            price_changed = abs(latest_tx.amount - prev_tx.amount) > 0.01
            sub_id = f"sub_{uuid.uuid4().hex[:8]}"

            sub = Subscription(
                id=sub_id,
                merchant=merchant,
                amount=latest_tx.amount,
                currency=latest_tx.currency,
                cadence=cadence,
                last_billed_at=latest_tx.occurred_at,
                next_billing_estimated=next_date,
                annual_cost=round(latest_tx.amount * annual_mult, 2),
                price_changed=price_changed,
                previous_amount=prev_tx.amount if price_changed else None,
                transaction_ids=[t.id for t in tx_list],
                status="active",
            )
            subscriptions.append(sub)

            # Generate Price hike Alert if price increased
            if price_changed and latest_tx.amount > prev_tx.amount:
                alerts.append(
                    Alert(
                        id=f"alt_price_{uuid.uuid4().hex[:8]}",
                        alert_type=AlertType.PRICE_HIKE,
                        title=f"Tăng giá dịch vụ: {merchant}",
                        status=AlertStatus.NEEDS_USER_CONFIRMATION,
                        reason=f"Khoản thanh toán {merchant} tăng từ ${prev_tx.amount:.2f} lên ${latest_tx.amount:.2f}.",
                        confidence=0.95,
                        confidence_label=get_confidence_label(0.95),
                        deadline_days=60,
                        transaction_ids=[latest_tx.id, prev_tx.id],
                        evidence_ids=[f"ev_tx_{latest_tx.id}", f"ev_tx_{prev_tx.id}"],
                        created_at=datetime.utcnow(),
                    )
                )

        return subscriptions, alerts
