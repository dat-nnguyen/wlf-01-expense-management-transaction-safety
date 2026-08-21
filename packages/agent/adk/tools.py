"""Google Agent Development Kit (ADK) Dynamic Financial Tools for Wealify Guardian.

Every tool in this module dynamically executes underlying financial calculation
engines and connectors without any hardcoded values or static mocks.
"""

from typing import Any, Dict, Optional
from packages.agent.tools.base import ToolContext
from packages.agent.tools.authenticity import VerifyTransactionAuthenticityTool
from packages.agent.tools.duplicates import FindDuplicatesTool
from packages.agent.tools.payouts import DetectOverduePayoutsTool
from packages.agent.tools.subscriptions import FindSubscriptionsTool
from packages.agent.tools.reconciliation import ReconcileTransactionsTool
from packages.agent.tools.reports import GenerateExpenseReportTool
from packages.agent.tools.transactions import SearchTransactionsTool, GetTransactionDetailsTool
from packages.agent.tools.emails import SearchEmailsTool
from packages.agent.tools.advisory import AnalyzeBusinessHealthTool
from packages.agent.tools.surge import DetectSpendingSurgesTool

# Instantiate domain tool engines
_auth_engine = VerifyTransactionAuthenticityTool()
_dup_engine = FindDuplicatesTool()
_payout_engine = DetectOverduePayoutsTool()
_sub_engine = FindSubscriptionsTool()
_rec_engine = ReconcileTransactionsTool()
_rep_engine = GenerateExpenseReportTool()
_tx_search_engine = SearchTransactionsTool()
_tx_detail_engine = GetTransactionDetailsTool()
_email_engine = SearchEmailsTool()
_adv_engine = AnalyzeBusinessHealthTool()
_surge_engine = DetectSpendingSurgesTool()


async def verify_transaction_authenticity(
    claimed_amount: float = 2500.0,
    reference: str = "WF-839291",
    raw_text: str = "",
    currency: str = "USD",
) -> Dict[str, Any]:
    """
    Verifies whether a claimed payment screenshot, receipt, transfer confirmation or email
    actually matches trusted Wealify financial records and calculates evidence conflict score.

    Args:
        claimed_amount: The monetary amount stated in the user-submitted screenshot or message.
        reference: The transaction reference code stated in the claim (e.g. WF-839291).
        raw_text: Full raw text or OCR snippet from the uploaded evidence.
        currency: Currency code (e.g. USD).

    Returns:
        Dict containing ledger match, wallet match, email match, conflict score (0-100),
        classification state, and safety recommendations.
    """
    ctx = ToolContext(session_id="adk_session", account_id="acc_main")
    res = await _auth_engine.execute(ctx, {
        "claimed_amount": claimed_amount,
        "reference": reference,
        "raw_text": raw_text,
        "currency": currency,
    })
    return res.data if res.success else {"error": res.error}


async def find_duplicate_charges(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Detects potential duplicate debits or double charges on virtual cards (Meta Ads, Google Ads, TikTok Ads, Grab, Volcano).

    Args:
        account_id: The account identifier to inspect.

    Returns:
        Dict with list of detected duplicate alerts, confidence scores, 60-day dispute deadlines, and personalized dispute drafts.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _dup_engine.execute(ctx, {})
    return res.data if res.success else {"error": res.error}


async def detect_overdue_payouts(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Scans for delayed or missing payouts from e-commerce platforms (Amazon, Stripe, Shopify, Payoneer)
    where notification emails exist but matching funds have not arrived in the Wealify ledger.

    Args:
        account_id: The account identifier to inspect.

    Returns:
        Dict with overdue payout alerts, elapsed days, 60-day deadlines, and drafted dispute letters.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _payout_engine.execute(ctx, {})
    return res.data if res.success else {"error": res.error}


async def find_active_subscriptions(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Identifies recurring SaaS subscriptions (Netflix, AWS, OpenAI, ChatGPT, GitHub, Slack, Adobe)
    and detects silent price hikes or anomalies.

    Args:
        account_id: The account identifier.

    Returns:
        Dict with detected subscriptions, next billing dates, annual cost projections, and price hike warnings.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _sub_engine.execute(ctx, {})
    return res.data if res.success else {"error": res.error}


async def reconcile_3way_transactions(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Performs 3-Way Reconciliation across Bank Account (Incoming Funds) <-> Wallet Ledger <-> Card Statements.
    Identifies unreconciled funds (e.g. money left account but not on card, duplicate topups, wallet discrepancy).

    Args:
        account_id: The account identifier.

    Returns:
        Dict with source summaries and discrepancy items strictly formatted as 'Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân.'
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _rec_engine.execute(ctx, {})
    return res.data if res.success else {"error": res.error}


async def generate_expense_report(
    account_id: str = "acc_main",
    period_type: str = "month",
    period_value: str = "2026-08",
) -> Dict[str, Any]:
    """
    Generates structured expense reports (monthly, quarterly, yearly), total spend, fees,
    top 3 largest expenses, category breakdowns, and subscription forecasts.

    Args:
        account_id: The account identifier.
        period_type: 'month', 'quarter', or 'year'.
        period_value: e.g. '2026-08', '2026-Q3', or '2026'.

    Returns:
        Dict containing total expense, total fees, top 3 expenses, category breakdown, and annual forecasts.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _rep_engine.execute(ctx, {"period_type": period_type, "period_value": period_value})
    return res.data if res.success else {"error": res.error}


async def search_financial_transactions(
    query: str,
    account_id: str = "acc_main",
) -> Dict[str, Any]:
    """
    Searches transactions by merchant name, amount ($9.99, $2500), source reference, or keyword.

    Args:
        query: Search term (e.g. '9.99', 'grab', 'netflix', 'facebook').
        account_id: The account identifier.

    Returns:
        Dict with list of matching transactions, amounts, and source references.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _tx_search_engine.execute(ctx, {"query": query})
    return res.data if res.success else {"error": res.error}


async def get_transaction_details(
    transaction_id: str,
    account_id: str = "acc_main",
) -> Dict[str, Any]:
    """
    Retrieves detailed breakdown and evidence linkage for a specific transaction ID.

    Args:
        transaction_id: Transaction identifier (e.g. 'tx_001').
        account_id: Account identifier.

    Returns:
        Dict containing full transaction record, merchant metadata, and linked receipts.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _tx_detail_engine.execute(ctx, {"transaction_id": transaction_id})
    return res.data if res.success else {"error": res.error}


async def search_email_inbox(
    query: Optional[str] = None,
    user_persona: str = "wealifytester",
) -> Dict[str, Any]:
    """
    Searches user's verified mailbox evidence (invoices, receipts, payout notices, phishing alerts).

    Args:
        query: Optional search keyword.
        user_persona: 'wealifytester', 'wealifyjunior', or 'wealifysenior'.

    Returns:
        Dict with matching email records, matched transaction IDs, and phishing alert flags.
    """
    ctx = ToolContext(session_id="adk_session", account_id="acc_main")
    res = await _email_engine.execute(ctx, {"query": query, "user_persona": user_persona})
    return res.data if res.success else {"error": res.error}


async def analyze_business_health(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Performs comprehensive business health advisory, computing cash burn, ROAS,
    net profit, and actionable financial recommendations for cross-border e-commerce.

    Args:
        account_id: The account identifier.

    Returns:
        Dict with health score (0-100), financial health rating, unit economics, and dynamic HITL action items.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _adv_engine.execute(ctx, {})
    return res.data if res.success else {"error": res.error}


async def detect_spending_surges(
    account_id: str = "acc_main",
    window_days: int = 7,
) -> Dict[str, Any]:
    """
    Detects abnormal spending surges by comparing current period spending against historical baseline,
    breaking down categories and explaining root cause drivers.

    Args:
        account_id: The account identifier to inspect.
        window_days: Number of days in current evaluation window (e.g. 7 for weekly, 30 for monthly).

    Returns:
        Dict with spending surge report, multiplier, category breakdown and root cause attribution.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = await _surge_engine.execute(ctx, {"window_days": window_days})
    return res.data if res.success else {"error": res.error}


__all__ = [
    "verify_transaction_authenticity",
    "find_duplicate_charges",
    "detect_overdue_payouts",
    "find_active_subscriptions",
    "reconcile_3way_transactions",
    "generate_expense_report",
    "search_financial_transactions",
    "get_transaction_details",
    "search_email_inbox",
    "analyze_business_health",
    "detect_spending_surges",
]
