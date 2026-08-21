from typing import List
from fastapi import APIRouter
from packages.data.schemas.alert import Alert
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.reconciliation.reconciler import ReconciliationEngine
from packages.financial.reconciliation.payout_radar import PayoutRadar
from packages.data.schemas.transaction import TransactionSource

router = APIRouter(prefix="/api/v1/reconciliation", tags=["Reconciliation"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()


@router.get("", response_model=List[Alert])
async def run_reconciliation():
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()

    account_txs = [t for t in all_txs if t.source == TransactionSource.ACCOUNT]
    wallet_txs = [t for t in all_txs if t.source == TransactionSource.WALLET]
    card_txs = [t for t in all_txs if t.source == TransactionSource.CARD]

    alerts = ReconciliationEngine.reconcile_sources(
        account_txs=account_txs,
        wallet_txs=wallet_txs,
        card_txs=card_txs,
        emails=emails,
    )
    return alerts


@router.get("/payouts", response_model=List[Alert])
async def detect_overdue_payouts():
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()
    alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=all_txs)
    return alerts
