from typing import Optional
from fastapi import APIRouter, Query
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.calculations.metrics import generate_financial_report, compute_monthly_summary, FinancialReport

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])
mock_txs = MockTransactionSource()


@router.get("/monthly", response_model=FinancialReport)
async def get_monthly_report(
    month: Optional[str] = Query(None, description="Month format YYYY-MM (e.g. 2026-08)"),
    account_id: str = "acc_main",
):
    txs = await mock_txs.get_transactions(account_id=account_id)
    return generate_financial_report(txs, period_type="month", period_value=month or "2026-08")


@router.get("/quarterly", response_model=FinancialReport)
async def get_quarterly_report(
    quarter: Optional[str] = Query(None, description="Quarter format YYYY-QX (e.g. 2026-Q3)"),
    account_id: str = "acc_main",
):
    txs = await mock_txs.get_transactions(account_id=account_id)
    return generate_financial_report(txs, period_type="quarter", period_value=quarter or "2026-Q3")


@router.get("/yearly", response_model=FinancialReport)
async def get_yearly_report(
    year: Optional[str] = Query(None, description="Year format YYYY (e.g. 2026)"),
    account_id: str = "acc_main",
):
    txs = await mock_txs.get_transactions(account_id=account_id)
    return generate_financial_report(txs, period_type="year", period_value=year or "2026")


@router.get("/forecast")
async def get_forecast_report(account_id: str = "acc_main"):
    txs = await mock_txs.get_transactions(account_id=account_id)
    report = generate_financial_report(txs, period_type="all", period_value="")
    return {
        "annual_subscription_forecast": report.subscription_forecast_annual,
        "next_period_subscription_forecast": report.subscription_forecast_next_period,
        "subscription_spending_current": report.subscription_spending,
        "price_hikes_count": report.price_hikes_count,
        "price_hikes": report.price_hikes,
        "top_3_expenses": report.top_3_expenses,
        "total_fees": report.total_fees,
    }
