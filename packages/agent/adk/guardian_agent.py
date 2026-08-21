"""Wealify Guardian — Google Agent Development Kit (ADK) Implementation.

Built using the official Google ADK (google-adk) framework.
Model-Agnostic / Native Gemini 2.0 / OpenRouter.
"""

import asyncio
from typing import Any, Dict, Optional
from google.adk import Agent

from packages.agent.tools.authenticity import VerifyTransactionAuthenticityTool
from packages.agent.tools.duplicates import FindDuplicatesTool
from packages.agent.tools.payouts import DetectOverduePayoutsTool
from packages.agent.tools.subscriptions import FindSubscriptionsTool
from packages.agent.tools.advisory import AnalyzeBusinessHealthTool
from packages.agent.tools.reports import GenerateExpenseReportTool
from packages.agent.tools.transactions import SearchTransactionsTool
from packages.agent.tools.emails import SearchEmailsTool
from packages.agent.tools.base import ToolContext
from packages.connectors.excel_inbox_connector import ExcelInboxConnector


# Instantiated tool engines
_auth_tool = VerifyTransactionAuthenticityTool()
_dup_tool = FindDuplicatesTool()
_payout_tool = DetectOverduePayoutsTool()
_sub_tool = FindSubscriptionsTool()
_adv_tool = AnalyzeBusinessHealthTool()
_rep_tool = GenerateExpenseReportTool()
_tx_tool = SearchTransactionsTool()
_email_tool = SearchEmailsTool()


# ==============================================================================
# GOOGLE ADK FUNCTION TOOLS
# ==============================================================================

def verify_transaction_authenticity(
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
    res = asyncio.run(_auth_tool.execute(ctx, {
        "claimed_amount": claimed_amount,
        "reference": reference,
        "raw_text": raw_text,
        "currency": currency,
    }))
    return res.data if res.success else {"error": res.error}


def find_duplicate_charges(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Detects potential duplicate debits or double charges on virtual cards (Meta Ads, Google Ads, TikTok Ads).

    Args:
        account_id: The account identifier to inspect.

    Returns:
        Dict with list of detected duplicate alerts, confidence scores, and dispute instructions.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_dup_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def detect_overdue_payouts(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Scans for delayed or missing payouts from e-commerce platforms (Amazon, Stripe, Shopify, Payoneer)
    where notification emails exist but matching funds have not arrived in the Wealify ledger.

    Args:
        account_id: The account identifier to inspect.

    Returns:
        Dict with overdue payout alerts, elapsed days, and drafted dispute letters.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_payout_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def find_active_subscriptions(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Identifies recurring SaaS subscriptions (Netflix, AWS, OpenAI, ChatGPT, GitHub, Slack)
    and detects silent price hikes or anomalies.

    Args:
        account_id: The account identifier.

    Returns:
        Dict with detected subscriptions, next billing dates, and price hike warnings.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_sub_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def analyze_business_health(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Performs comprehensive business health advisory, computing cash burn, ROAS,
    net profit, and actionable financial recommendations for cross-border e-commerce.

    Args:
        account_id: The account identifier.

    Returns:
        Dict with health score (0-100), financial health rating, unit economics, and insights.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_adv_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def scan_mailbox_evidence(
    user_persona: str = "wealifytester",
    query: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Scans the official test mailbox (148 emails) for payment receipts, payout notifications,
    or suspicious phishing emails from attackers.

    Args:
        user_persona: One of 'wealifytester', 'wealifyjunior', 'wealifysenior'.
        query: Optional search keyword (e.g. 'payoneer', 'netflix', 'phishing').

    Returns:
        Dict with list of matching email evidence records and phishing alert flags.
    """
    connector = ExcelInboxConnector()
    phishing = connector.get_phishing_emails(user_persona=user_persona)
    return {
        "status": "success",
        "persona": user_persona,
        "phishing_alerts": [p.model_dump() for p in phishing],
        "total_phishing_detected": len(phishing),
    }


def detect_spending_surges(
    account_id: str = "acc_main",
    window_days: int = 7,
) -> Dict[str, Any]:
    """
    Detects abnormal spending surges by comparing current period spending against historical baseline,
    breaking down categories and explaining root cause drivers.

    Args:
        account_id: The account identifier to inspect.
        window_days: Number of days in the current evaluation window (e.g. 7 for weekly, 30 for monthly).

    Returns:
        Dict with spending surge report, multiplier, category breakdown and root cause attribution.
    """
    from packages.agent.tools.surge import DetectSpendingSurgesTool
    tool = DetectSpendingSurgesTool()
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(tool.execute(ctx, {"window_days": window_days}))
    return res.data if res.success else {"error": res.error}


# ==============================================================================
# GOOGLE ADK ROOT AGENT
# ==============================================================================

GUARDIAN_INSTRUCTION = """
Bạn là Wealify Guardian — AI Expense Management & Transaction Safety Copilot được xây dựng theo chuẩn Google Agent Development Kit (ADK).
Nguyên tắc hoạt động bất biến:
1. 'LLM diễn giải & tổng hợp. Financial Engine tính toán. Bằng chứng chứng minh. Con người quyết định.'
2. Chế độ an toàn: Hoạt động Read-Only. Không trực tiếp chuyển tiền hay can thiệp số dư.
3. Luôn đối chiếu 3 nguồn: Sổ cái (Ledger), Ví (Wallet), và Hộp thư (Email).
4. Sử dụng 3 trạng thái phân loại chuẩn: 'Định kỳ đã xác định', 'Cần bạn tự xác nhận', 'Chưa đủ dữ liệu'.
5. Nhắc nhở người dùng về thời hạn khiếu nại quy định 60 ngày theo luật ngân hàng Mỹ (Regulation E).
6. Khi phát hiện email lừa đảo (như mạo danh wea1ify-support.com), cảnh báo rủi ro cao ngay lập tức.
7. Phát hiện chi tiêu đột biến so với baseline lịch sử và giải thích nguyên nhân theo từng danh mục.
"""

root_agent = Agent(
    name="wealify_guardian",
    description="Wealify Guardian — Enterprise AI Expense Management & Transaction Safety Agent",
    instruction=GUARDIAN_INSTRUCTION,
    tools=[
        verify_transaction_authenticity,
        find_duplicate_charges,
        detect_overdue_payouts,
        find_active_subscriptions,
        analyze_business_health,
        scan_mailbox_evidence,
        detect_spending_surges,
    ],
)
