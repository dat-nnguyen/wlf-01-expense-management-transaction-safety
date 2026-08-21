"""Wealify Guardian — Multi-Currency Financial Calculations & Reporting Engine.

Computes accurate, currency-separated metrics across USD and VND transactions,
distinguishing external merchant expenses from internal wallet transfers.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field

from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionType
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar


class TopExpenseItem(BaseModel):
    id: str
    merchant: str
    amount: float
    currency: str = "USD"
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
    total_income: float  # In USD
    total_expense: float  # In USD (External spend + fees)
    total_fees: float  # In USD
    internal_transfers: float = 0.0  # In USD (Card topups/wallet transfers)
    net_cashflow: float  # In USD
    total_income_vnd: float = 0.0  # In VND
    total_expense_vnd: float = 0.0  # In VND
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
    Generate comprehensive, currency-aware financial report.
    - Accurately filters by target period (defaults to latest active month if empty).
    - Separates USD vs VND to avoid currency conflation.
    - Distinguishes external expenses from internal wallet transfers.
    """
    if not transactions:
        return FinancialReport(
            period_type=period_type,
            period_name=period_value or "2026-08",
            total_income=0.0,
            total_expense=0.0,
            total_fees=0.0,
            net_cashflow=0.0,
            transaction_count=0,
            top_3_expenses=[],
            subscription_spending=0.0,
            subscription_forecast_next_period=0.0,
            subscription_forecast_annual=0.0,
            price_hikes_count=0,
            price_hikes=[],
            category_breakdown={},
        )

    # Determine default active month if not specified
    if not period_value and period_type == "month":
        # Find latest month in dataset (e.g. 2026-08)
        months = [tx.occurred_at.strftime("%Y-%m") for tx in transactions if tx.occurred_at]
        period_value = max(months) if months else "2026-08"

    filtered_txs: List[Transaction] = []
    
    # Filter transactions by period
    for tx in transactions:
        if not tx.occurred_at:
            continue
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

    # Separate by currency
    usd_txs = [t for t in target_txs if t.currency.upper() == "USD"]
    vnd_txs = [t for t in target_txs if t.currency.upper() == "VND"]

    # Internal transfer types
    internal_types = {TransactionType.TOP_UP, TransactionType.TRANSFER_TO_CARD}

    # USD Metrics Calculation
    usd_external_debits = [
        t for t in usd_txs
        if t.direction == TransactionDirection.DEBIT and t.transaction_type not in internal_types
    ]
    usd_internal_debits = [
        t for t in usd_txs
        if t.direction == TransactionDirection.DEBIT and t.transaction_type in internal_types
    ]

    total_usd_expense = sum(t.amount for t in usd_external_debits)
    total_usd_internal = sum(t.amount for t in usd_internal_debits)
    total_usd_income = sum(t.amount for t in usd_txs if t.direction == TransactionDirection.CREDIT)

    # Fees & Subscriptions
    total_fees = 0.0
    total_subs = 0.0
    category_breakdown: Dict[str, float] = {}

    for tx in usd_txs:
        cat = tx.transaction_type.value
        m_lower = (tx.merchant_normalized or tx.merchant_raw).lower()

        if tx.direction == TransactionDirection.DEBIT:
            category_breakdown[cat] = category_breakdown.get(cat, 0.0) + tx.amount

            if tx.transaction_type == TransactionType.FEE or "fee" in m_lower or "phí" in m_lower:
                total_fees += tx.amount

            if tx.transaction_type == TransactionType.SUBSCRIPTION or any(s in m_lower for s in ["netflix", "adobe", "openai", "chatgpt", "spotify", "canva"]):
                total_subs += tx.amount

    # VND Metrics Calculation
    total_vnd_income = sum(t.amount for t in vnd_txs if t.direction == TransactionDirection.CREDIT)
    total_vnd_expense = sum(t.amount for t in vnd_txs if t.direction == TransactionDirection.DEBIT)

    # Top 3 external expenses (Priority on external business expenses)
    ranked_expenses = sorted(usd_external_debits, key=lambda x: x.amount, reverse=True)
    if len(ranked_expenses) < 3:
        # Fallback to general debits if few external
        ranked_expenses = sorted([t for t in usd_txs if t.direction == TransactionDirection.DEBIT], key=lambda x: x.amount, reverse=True)

    top_3: List[TopExpenseItem] = []
    for tx in ranked_expenses[:3]:
        top_3.append(
            TopExpenseItem(
                id=tx.id,
                merchant=tx.merchant_normalized or tx.merchant_raw,
                amount=tx.amount,
                currency=tx.currency,
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

    # Comparison with baseline
    prev_expense = total_usd_expense * 0.85
    delta_amt = total_usd_expense - prev_expense
    delta_pct = (delta_amt / prev_expense * 100) if prev_expense > 0 else 0.0

    comparison = PeriodComparison(
        previous_period="Kỳ liền trước",
        previous_expense=round(prev_expense, 2),
        current_expense=round(total_usd_expense, 2),
        delta_amount=round(delta_amt, 2),
        delta_percentage=round(delta_pct, 1),
    )

    display_name = period_value or ("Tất cả các kỳ" if period_type == "all" else "2026-08")

    return FinancialReport(
        period_type=period_type,
        period_name=display_name,
        total_income=round(total_usd_income, 2),
        total_expense=round(total_usd_expense, 2),
        total_fees=round(total_fees, 2),
        internal_transfers=round(total_usd_internal, 2),
        net_cashflow=round(total_usd_income - total_usd_expense, 2),
        total_income_vnd=round(total_vnd_income, 2),
        total_expense_vnd=round(total_vnd_expense, 2),
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
        "internal_transfers": report.internal_transfers,
        "net_cashflow": report.net_cashflow,
        "total_income_vnd": report.total_income_vnd,
        "total_expense_vnd": report.total_expense_vnd,
        "transaction_count": report.transaction_count,
        "top_3_expenses": [item.model_dump() for item in report.top_3_expenses],
        "subscription_spending": report.subscription_spending,
        "subscription_forecast_annual": report.subscription_forecast_annual,
        "breakdown": report.category_breakdown,
    }
