import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ExecutionPlan(BaseModel):
    intent: str
    target_tool: Optional[str] = None
    arguments: Dict[str, Any] = {}
    confidence: float = 1.0


class IntentPlanner:
    """Classifies user query intent and builds structured execution plan."""

    @staticmethod
    def plan(user_message: str) -> ExecutionPlan:
        msg = user_message.lower().strip()

        # 1. Payment Authenticity & Fake Screenshot / Scam Detection Check (Priority 1)
        if any(k in msg for k in [
            "gửi ảnh", "ảnh chuyển", "ảnh thanh toán", "ảnh giao dịch", "kiểm tra ảnh",
            "xác minh giao dịch", "xác thực giao dịch", "có thật không", "biên lai giả",
            "wf-839291", "wf-99210", "fake payment", "verify payment", "screenshot",
            "nói wealify đã chuyển", "nói đã chuyển", "nhận được email nói tiền đã chuyển",
            "người này gửi ảnh", "chuyển $2,500 cho tôi", "chuyển $2500 cho tôi",
        ]):
            return ExecutionPlan(
                intent="VERIFY_TRANSACTION_AUTHENTICITY",
                target_tool="verify_transaction_authenticity",
                arguments={"raw_text": user_message},
            )

        # 2. Check Disallowed Mutating Actions (Imperative commands)
        if (
            re.search(r"(?:hãy\s+|vui lòng\s+|tự\s+|hộ\s+)?(?:chuyển|bắn|gửi|rút|nạp|pay|transfer|send|wire)\s+.*(?:tiền|\$|\d+|sang|tới|vào|cho|tài khoản|stk|account|wallet|ví)", msg, re.IGNORECASE)
            or re.search(r"(?:chuyển|transfer|send|wire)\s+\$?\d+", msg, re.IGNORECASE)
            or re.search(r"(?:hãy\s+|tự\s+|vui lòng\s+)?(?:huỷ|hủy|dừng|ngắt|cancel|unsubscribe)\s+(?:subscription|gói|dịch vụ|membership|netflix|adobe|spotify)", msg, re.IGNORECASE)
            or re.search(r"chargeback|đòi tiền lại ngay|tự hoàn tiền trực tiếp|tự động hoàn tiền", msg, re.IGNORECASE)
            or re.search(r"(?:hãy\s+|tự\s+|vui lòng\s+)?(?:khóa|khoá|block|freeze|lock)\s+thẻ|lock\s+card|block\s+card", msg, re.IGNORECASE)
        ):
            return ExecutionPlan(
                intent="DISALLOWED_MUTATION",
                target_tool=None,
                arguments={},
            )

        # 3. Email Alert Explanation & Support Inquiry (Giải thích lý do gửi mail cảnh báo)
        if any(k in msg for k in ["tại sao gửi mail", "lý do gửi mail", "tại sao nhận được mail", "giải thích email", "email cảnh báo", "support", "hướng dẫn khiếu nại", "thư cảnh báo"]):
            return ExecutionPlan(
                intent="EXPLAIN_ALERT_EMAIL",
                target_tool="detect_overdue_payouts",
                arguments={},
            )

        # 4. Overdue / Missing Payout Radar
        if any(k in msg for k in ["payout", "chưa về", "chưa tới", "bên bán", "amazon", "stripe", "shopify", "14 ngày", "15 ngày", "chậm tiền", "giải ngân", "settlement"]):
            return ExecutionPlan(
                intent="OVERDUE_PAYOUT_CHECK",
                target_tool="detect_overdue_payouts",
                arguments={},
            )

        # 5. Business Health & Financial Advisory
        if any(k in msg for k in ["kinh doanh", "lợi nhuận", "lãi", "lỗ", "hiệu quả", "có nên tiếp tục", "sức khỏe", "tư vấn", "roas", "burn rate", "tình hình tài chính"]):
            return ExecutionPlan(
                intent="BUSINESS_HEALTH_ADVISORY",
                target_tool="analyze_business_health",
                arguments={},
            )

        # 6. Duplicate Detection (Virtual Cards / Multi-charge)
        if any(k in msg for k in ["trùng", "hai lần", "2 lần", "cà 2 lần", "quẹt 2 lần", "duplicate", "bị trừ đúp", "cà thẻ", "facebook ads này sao bị cảnh báo"]):
            return ExecutionPlan(
                intent="DUPLICATE_CHECK",
                target_tool="find_duplicates",
                arguments={"time_window_hours": 48},
            )

        # 7. Subscriptions & Price Hike Inquiry
        if any(k in msg for k in ["subscription", "tăng giá", "định kỳ", "gói tháng", "hàng tháng", "netflix", "spotify", "adobe", "openai", "chatgpt"]):
            return ExecutionPlan(
                intent="SUBSCRIPTION_INQUIRY",
                target_tool="find_subscriptions",
                arguments={},
            )

        # 8. Multi-Source Reconciliation
        if any(k in msg for k in ["đối soát", "lệch", "chưa lên", "reconcile", "rời account", "wallet"]):
            return ExecutionPlan(
                intent="RECONCILIATION_CHECK",
                target_tool="reconcile_transactions",
                arguments={},
            )

        # 9. Monthly Summary / Report
        if any(k in msg for k in ["chi bao nhiêu", "tổng chi", "báo cáo", "tháng này", "summary", "report"]):
            return ExecutionPlan(
                intent="MONTHLY_SUMMARY",
                target_tool="generate_expense_report",
                arguments={},
            )

        # 10. Specific Transaction Search
        if any(k in msg for k in ["tìm", "khoản", "search", "giao dịch", "grab", "apple", "facebook"]):
            query_match = re.search(r"(?:tìm|khoản|search)\s+([a-zA-Z0-9\$\.\s]+)", msg)
            query = query_match.group(1).strip() if query_match else ""
            return ExecutionPlan(
                intent="TRANSACTION_SEARCH",
                target_tool="search_transactions",
                arguments={"query": query},
            )

        # Default General QA
        return ExecutionPlan(
            intent="GENERAL_QA",
            target_tool=None,
            arguments={},
        )
