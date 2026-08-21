from fastapi import APIRouter
from packages.data.schemas.advisory import BusinessHealthReport
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.advisory.business_advisor import BusinessAdvisor
from packages.financial.reconciliation.payout_radar import PayoutRadar

router = APIRouter(prefix="/api/v1/advisory", tags=["Business Advisory"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()


@router.get("/health", response_model=BusinessHealthReport)
async def get_business_health(account_id: str = "acc_main"):
    txs = await tx_source.get_transactions(account_id=account_id)
    emails = await em_source.get_emails()

    payout_alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=txs)
    report = BusinessAdvisor.analyze_health(account_id=account_id, transactions=txs, payout_alerts=payout_alerts)
    return report
