from typing import Optional
from fastapi import APIRouter, Query
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.calculations.metrics import compute_monthly_summary

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])
mock_txs = MockTransactionSource()


@router.get("/monthly")
async def get_monthly_report(
    month: Optional[str] = Query(None, description="Month format YYYY-MM (e.g. 2026-08)"),
):
    txs = await mock_txs.get_transactions()
    summary = compute_monthly_summary(txs, month_str=month or "")
    return summary
