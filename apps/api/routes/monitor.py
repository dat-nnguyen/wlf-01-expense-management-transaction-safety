from typing import List
from fastapi import APIRouter
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.data.schemas.transaction import TransactionSource
from packages.financial.monitoring.proactive_monitor import (
    ProactiveMonitorEngine,
    ProactiveMonitorState,
    ScanReport,
)

router = APIRouter(prefix="/api/v1/monitor", tags=["Proactive Monitoring"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()


@router.get("/status", response_model=ProactiveMonitorState)
async def get_monitor_status():
    """
    Returns the real-time status of the proactive background monitor.
    """
    return ProactiveMonitorEngine.get_status()


@router.post("/scan", response_model=ScanReport)
async def trigger_proactive_scan():
    """
    Triggers an on-demand proactive scan with strict deduplication:
    Never re-alerts on previously alerted transactions or sends duplicate notifications.
    """
    all_txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()

    account_txs = [t for t in all_txs if t.source == TransactionSource.ACCOUNT]
    wallet_txs = [t for t in all_txs if t.source == TransactionSource.WALLET]
    card_txs = [t for t in all_txs if t.source == TransactionSource.CARD]

    report = ProactiveMonitorEngine.run_scan(
        current_transactions=all_txs,
        account_txs=account_txs,
        wallet_txs=wallet_txs,
        card_txs=card_txs,
        emails=emails,
    )
    return report


@router.get("/history", response_model=List[ScanReport])
async def get_scan_history():
    """
    Returns the history of proactive scans and state snapshots.
    """
    return ProactiveMonitorEngine.get_history()


@router.post("/toggle")
async def toggle_monitor(enable: bool):
    """
    Enables or disables the background scheduler.
    """
    ProactiveMonitorEngine.set_running(enable)
    return {"is_running": enable, "message": f"Proactive monitoring has been {'enabled' if enable else 'disabled'}."}
