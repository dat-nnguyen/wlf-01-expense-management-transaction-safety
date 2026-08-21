from typing import List
from fastapi import APIRouter, Depends
from packages.data.schemas.alert import Alert
from packages.db.repositories.alert_repo import AlertRepository
from apps.api.dependencies import get_alert_repo
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.anomaly.duplicate_detector import DuplicateDetector
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar
from packages.financial.reconciliation.payout_radar import PayoutRadar

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])
mock_txs = MockTransactionSource()
mock_emails = MockEmailSource()


@router.get("", response_model=List[Alert])
async def list_alerts(
    repo: AlertRepository = Depends(get_alert_repo),
):
    txs = await mock_txs.get_transactions()
    emails = await mock_emails.get_emails()

    # 1. Payout Alerts
    payout_alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=txs)

    # 2. Duplicate Alerts
    dup_results = DuplicateDetector.find_duplicates(txs)
    dup_alerts = [a for _, _, a in dup_results]

    # 3. Subscription Price Hike Alerts
    _, sub_alerts = SubscriptionRadar.detect_subscriptions(txs)

    all_alerts = payout_alerts + dup_alerts + sub_alerts
    return all_alerts
