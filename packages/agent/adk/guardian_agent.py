"""Wealify Guardian — Google Agent Development Kit (ADK) Implementation.

Built using the official Google ADK (google-adk) framework.
Model-Agnostic / Native Gemini 2.0 / OpenRouter / Deterministic Fallback.
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
from packages.agent.tools.reconciliation import ReconcileTransactionsTool
from packages.agent.tools.surge import DetectSpendingSurgesTool
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
_rec_tool = ReconcileTransactionsTool()
_surge_tool = DetectSpendingSurgesTool()


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
    Detects potential duplicate debits or double charges on virtual cards (Meta Ads, Google Ads, TikTok Ads, Grab, Volcano).

    Args:
        account_id: The account identifier to inspect.

    Returns:
        Dict with list of detected duplicate alerts, confidence scores, 60-day dispute deadlines, and personalized dispute drafts.
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
        Dict with overdue payout alerts, elapsed days, 60-day deadlines, and drafted dispute letters.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_payout_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def find_active_subscriptions(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Identifies recurring SaaS subscriptions (Netflix, AWS, OpenAI, ChatGPT, GitHub, Slack, Adobe)
    and detects silent price hikes or anomalies.

    Args:
        account_id: The account identifier.

    Returns:
        Dict with detected subscriptions, next billing dates, annual cost projections, and price hike warnings.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_sub_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def reconcile_3way_transactions(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Performs 3-Way Reconciliation across Bank Account (Incoming Funds) <-> Wallet Ledger <-> Card Statements.
    Identifies unreconciled funds (e.g. money left account but not on card, duplicate topups, wallet discrepancy).

    Args:
        account_id: The account identifier.

    Returns:
        Dict with source summaries and discrepancy items strictly formatted as 'Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân.'
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_rec_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def generate_expense_report(
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
    res = asyncio.run(_rep_tool.execute(ctx, {"period_type": period_type, "period_value": period_value}))
    return res.data if res.success else {"error": res.error}


def search_financial_transactions(
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
    res = asyncio.run(_tx_tool.execute(ctx, {"query": query}))
    return res.data if res.success else {"error": res.error}


def search_email_inbox(
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
    res = asyncio.run(_email_tool.execute(ctx, {"query": query, "user_persona": user_persona}))
    return res.data if res.success else {"error": res.error}


def analyze_business_health(account_id: str = "acc_main") -> Dict[str, Any]:
    """
    Performs comprehensive business health advisory, computing cash burn, ROAS,
    net profit, and actionable financial recommendations for cross-border e-commerce.

    Args:
        account_id: The account identifier.

    Returns:
        Dict with health score (0-100), financial health rating, unit economics, and dynamic HITL action items.
    """
    ctx = ToolContext(session_id="adk_session", account_id=account_id)
    res = asyncio.run(_adv_tool.execute(ctx, {}))
    return res.data if res.success else {"error": res.error}


def detect_spending_surges(
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
    res = asyncio.run(_surge_tool.execute(ctx, {"window_days": window_days}))
    return res.data if res.success else {"error": res.error}


# ==============================================================================
# GOOGLE ADK ROOT AGENT CONFIGURATION
# ==============================================================================

GUARDIAN_INSTRUCTION = """
Bạn là Wealify Guardian — Trợ lý AI Quản lý Chi tiêu & An toàn Giao dịch (AI Expense Management & Transaction Safety Copilot) được xây dựng theo chuẩn Google Agent Development Kit (ADK).

NGUYÊN TẮC BẤT BIẾN THEO QUY CHUẨN ĐỀ THI WLF-01:
1. Ranh giới Read-Only: Tuyệt đối KHÔNG tự ý thực hiện giao dịch chuyển tiền, KHÔNG tự hủy gói dịch vụ, KHÔNG tự mở khiếu nại/chargeback, KHÔNG khóa/mở thẻ. Mọi hành động chỉ mang tính chất hướng dẫn và soạn thảo bản nháp (Draft) để người dùng tự quyết định.
2. Email Báo Cáo & Tự Gửi: Chỉ gửi email báo cáo tới CHÍNH ĐỊA CHỈ EMAIL CỦA NGƯỜI DÙNG khi có yêu cầu và PHẢI XÁC NHẬN (Confirm) trước khi gửi. CẤM tự ý gửi email cho ngân hàng, cửa hàng hoặc bên thứ ba.
3. Ba nhãn phân loại chuẩn bắt buộc: Mỗi cảnh báo hoặc phát hiện phải được gắn chính xác 1 trong 3 nhãn:
   - 'Định kỳ đã xác định' (Identified Recurring)
   - 'Cần bạn tự xác nhận' (Needs your confirmation)
   - 'Chưa đủ dữ liệu' (Insufficient data)
   Tuyệt đối không phán quyết chắc chắn "100% gian lận" hoặc "100% lừa đảo".
4. Mốc hạn khiếu nại quy định 60 ngày: Mọi giao dịch đáng ngờ/lệch lạc phải nhắc nhở mốc hạn khiếu nại 60 ngày theo luật Ngân hàng Mỹ (Regulation E) kể từ ngày nhận sao kê.
5. CẤM câu trấn an tuyệt đối: Không bao giờ nói 'Tài khoản của bạn an toàn tuyệt đối' hoặc 'Không có gì bất thường'. Khi người dùng hỏi về an toàn, giải thích rõ: 'Hệ thống chỉ có thể chỉ ra những giao dịch có dấu hiệu cần kiểm tra dựa trên dữ liệu hiện có, không đưa ra kết luận an toàn tuyệt đối.'
6. Khi 3 nguồn lệch nhau (Account <-> Wallet <-> Card), phải diễn giải chính xác: 'Lệch $X giữa [Nguồn A] và [Nguồn B] — chưa xác định nguyên nhân.'
7. Tên cửa hàng / Đơn vị thụ hưởng: Nếu không nhận diện được rõ ràng, ghi 'Chưa xác định được', không đoán bừa.
8. Giữ an toàn bảo mật: Che số thẻ (chỉ hiện 4 số cuối) và số tài khoản, không bao giờ hiện hay lưu mã CVV 3 số.
9. Hỗ trợ song ngữ chuẩn mực: Tự động phát hiện và phản hồi chuẩn xác bằng tiếng Việt hoặc tiếng Anh tương ứng với ngôn ngữ của người dùng.
10. Dòng lưu ý bắt buộc cuối mỗi báo cáo / tư vấn:
   'Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify và không thay cho việc bạn tự kiểm tra. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — ở Mỹ thời hạn khiếu nại là 60 ngày kể từ ngày ngân hàng gửi sao kê.'
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
        reconcile_3way_transactions,
        generate_expense_report,
        search_financial_transactions,
        search_email_inbox,
        analyze_business_health,
        detect_spending_surges,
    ],
)

