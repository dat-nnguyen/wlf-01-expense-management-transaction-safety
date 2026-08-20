from typing import List
from fastapi import APIRouter, Depends
from packages.data.schemas.alert import Alert
from packages.db.repositories.alert_repo import AlertRepository
from apps.api.dependencies import get_alert_repo
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.anomaly.duplicate_detector import DuplicateDetector
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])
mock_txs = MockTransactionSource()


@router.get("", response_model=List[Alert])
async def list_alerts(
    repo: AlertRepository = Depends(get_alert_repo),
):
    # Retrieve persisted alerts or compute live from current transactions
    db_alerts = repo.get_all()
    if db_alerts:
        return db_alerts

    txs = await mock_txs.get_transactions()
    _, dup_alerts = zip(*[(None, a) for _, _, a in DuplicateDetector.find_duplicates(txs)]) if DuplicateDetector.find_duplicates(txs) else ([], [])
    _, sub_alerts = SubscriptionRadar.detect_subscriptions(txs)

    all_alerts = list(dup_alerts) + list(sub_alerts)
    return all_alerts
