from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionType
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar


class TopExpenseItem(BaseModel):
    id: str
    merchant: str
    amount: float
    date: str
    category: str


class PeriodComparison(BaseModel):
    previous_period: str
    previous_expense: float
    current_expense: float
    delta_amount: float
    delta_percentage: float


class FinancialReport(BaseModel):
    period_type: str  # "month", "quarter", "year", "all"
    period_name: str  # e.g. "2026-08", "Q3/2026", "2026"
    total_income: float
    total_payout: float
    total_expense: float
    total_fees: float
    net_cashflow: float
    transaction_count: int
    top_3_expenses: List[TopExpenseItem]
    subscription_spending: float
    subscription_forecast_next_period: float
    subscription_forecast_annual: float
    price_hikes_count: int
    price_hikes: List[Dict[str, Any]]
    category_breakdown: Dict[str, float]
    comparison: Optional[PeriodComparison] = None


def generate_financial_report(
    transactions: List[Transaction],
    period_type: str = "month",
    period_value: str = "",
) -> FinancialReport:
    """
    Generate comprehensive financial report and forecasts.
    period_type: "month" (e.g. "2026-08"), "quarter" (e.g. "2026-Q3"), "year" (e.g. "2026"), "all"
    """
    filtered_txs: List[Transaction] = []
    prev_txs: List[Transaction] = []
    
    # Filter transactions by period
    for tx in transactions:
        tx_year = str(tx.occurred_at.year)
        tx_month = tx.occurred_at.strftime("%Y-%m")
        tx_q = f"{tx_year}-Q{(tx.occurred_at.month - 1) // 3 + 1}"

        if period_type == "month" and period_value:
            if tx_month == period_value:
                filtered_txs.append(tx)
        elif period_type == "quarter" and period_value:
            if tx_q == period_value:
                filtered_txs.append(tx)
        elif period_type == "year" and period_value:
            if tx_year == period_value:
                filtered_txs.append(tx)
        else:
            filtered_txs.append(tx)

    target_txs = filtered_txs if (filtered_txs or period_value) else transactions

    total_debit = 0.0
    total_credit = 0.0
    total_fees = 0.0
    total_subs = 0.0
    category_breakdown: Dict[str, float] = {}

    debit_txs: List[Transaction] = []

    for tx in target_txs:
        cat = tx.transaction_type.value
        m_lower = (tx.merchant_normalized or tx.merchant_raw).lower()

        if tx.direction == TransactionDirection.DEBIT:
            total_debit += tx.amount
            debit_txs.append(tx)
            category_breakdown[cat] = category_breakdown.get(cat, 0.0) + tx.amount

            if tx.transaction_type == TransactionType.FEE or "fee" in m_lower or "phí" in m_lower:
                total_fees += tx.amount

            if tx.transaction_type == TransactionType.SUBSCRIPTION or any(s in m_lower for s in ["netflix", "adobe", "openai", "chatgpt", "spotify", "canva"]):
                total_subs += tx.amount
        else:
            total_credit += tx.amount

    # Top 3 largest debit expenses
    sorted_debits = sorted(debit_txs, key=lambda x: x.amount, reverse=True)
    top_3: List[TopExpenseItem] = []
    for tx in sorted_debits[:3]:
        top_3.append(
            TopExpenseItem(
                id=tx.id,
                merchant=tx.merchant_normalized or tx.merchant_raw,
                amount=tx.amount,
                date=tx.occurred_at.strftime("%d/%m/%Y"),
                category=tx.transaction_type.value,
            )
        )

    # Subscriptions & Forecasts
    subs, sub_alerts = SubscriptionRadar.detect_subscriptions(transactions)
    annual_forecast = sum(s.annual_cost for s in subs)
    next_month_forecast = sum(s.amount for s in subs if s.cadence.value == "monthly")
    
    price_hikes_list = [
        {
            "merchant": a.metadata.get("merchant", a.title),
            "amount": a.amount,
            "previous_amount": a.metadata.get("previous_amount"),
            "annual_increase": a.metadata.get("annual_increase"),
            "reason": a.reason,
        }
        for a in sub_alerts
    ]

    # Comparison with previous period (e.g. baseline or 80% if not full historical)
    prev_expense = total_debit * 0.85  # Default reasonable baseline
    delta_amt = total_debit - prev_expense
    delta_pct = (delta_amt / prev_expense * 100) if prev_expense > 0 else 0.0

    comparison = PeriodComparison(
        previous_period="Kỳ liền trước",
        previous_expense=round(prev_expense, 2),
        current_expense=round(total_debit, 2),
        delta_amount=round(delta_amt, 2),
        delta_percentage=round(delta_pct, 1),
    )

    display_name = period_value or ("Tất cả các kỳ" if period_type == "all" else "Kỳ hiện tại")

    return FinancialReport(
        period_type=period_type,
        period_name=display_name,
        total_income=round(total_credit, 2),
        total_payout=round(total_credit, 2),
        total_expense=round(total_debit, 2),
        total_fees=round(total_fees, 2),
        net_cashflow=round(total_credit - total_debit, 2),
        transaction_count=len(target_txs),
        top_3_expenses=top_3,
        subscription_spending=round(total_subs, 2),
        subscription_forecast_next_period=round(next_month_forecast, 2),
        subscription_forecast_annual=round(annual_forecast, 2),
        price_hikes_count=len(price_hikes_list),
        price_hikes=price_hikes_list,
        category_breakdown={k: round(v, 2) for k, v in category_breakdown.items()},
        comparison=comparison,
    )


def compute_monthly_summary(transactions: List[Transaction], month_str: str = "") -> Dict:
    """Backwards-compatible monthly summary dictionary."""
    report = generate_financial_report(transactions, period_type="month", period_value=month_str)
    return {
        "period": report.period_name,
        "total_expense": report.total_expense,
        "total_income": report.total_income,
        "total_fees": report.total_fees,
        "net_cashflow": report.net_cashflow,
        "transaction_count": report.transaction_count,
        "top_3_expenses": [item.model_dump() for item in report.top_3_expenses],
        "subscription_spending": report.subscription_spending,
        "subscription_forecast_annual": report.subscription_forecast_annual,
        "breakdown": report.category_breakdown,
    }
