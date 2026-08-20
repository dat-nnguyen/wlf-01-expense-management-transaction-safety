from typing import Dict, List
from packages.data.schemas.transaction import Transaction, TransactionDirection


def compute_monthly_summary(transactions: List[Transaction], month_str: str = "") -> Dict:
    """
    Summarize total debit expenses, credit income, and net balance for a given month.
    month_str: e.g. "2026-08" or empty for all
    """
    total_debit = 0.0
    total_credit = 0.0
    category_breakdown: Dict[str, float] = {}

    for tx in transactions:
        if month_str and tx.occurred_at.strftime("%Y-%m") != month_str:
            continue

        if tx.direction == TransactionDirection.DEBIT:
            total_debit += tx.amount
            cat = tx.transaction_type.value
            category_breakdown[cat] = category_breakdown.get(cat, 0.0) + tx.amount
        else:
            total_credit += tx.amount

    return {
        "period": month_str or "All time",
        "total_expense": round(total_debit, 2),
        "total_income": round(total_credit, 2),
        "net_cashflow": round(total_credit - total_debit, 2),
        "transaction_count": len(transactions),
        "breakdown": {k: round(v, 2) for k, v in category_breakdown.items()},
    }
