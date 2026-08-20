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

        # 1. Check Disallowed Actions
        if re.search(r"chuyển\s+(\$?\d+|tiền|khoản|qua)|transfer|huỷ subscription|hủy gói|cancel subscription|khóa thẻ|lock card", msg, re.IGNORECASE):
            return ExecutionPlan(
                intent="DISALLOWED_MUTATION",
                target_tool=None,
                arguments={},
            )

        # 2. Duplicate Detection
        if any(k in msg for k in ["trùng", "hai lần", "2 lần", "duplicate", "bị trừ đúp"]):
            return ExecutionPlan(
                intent="DUPLICATE_CHECK",
                target_tool="find_duplicates",
                arguments={"time_window_hours": 48},
            )

        # 3. Subscriptions Inquiry
        if any(k in msg for k in ["subscription", "định kỳ", "gói tháng", "hàng tháng", "netflix", "spotify", "adobe"]):
            return ExecutionPlan(
                intent="SUBSCRIPTION_INQUIRY",
                target_tool="find_subscriptions",
                arguments={},
            )

        # 4. Reconciliation
        if any(k in msg for k in ["đối soát", "lệch", "chưa lên", "reconcile", "rời account", "wallet"]):
            return ExecutionPlan(
                intent="RECONCILIATION_CHECK",
                target_tool="reconcile_transactions",
                arguments={},
            )

        # 5. Monthly Summary / Report
        if any(k in msg for k in ["chi bao nhiêu", "tổng chi", "báo cáo", "tháng này", "summary", "report"]):
            return ExecutionPlan(
                intent="MONTHLY_SUMMARY",
                target_tool="generate_expense_report",
                arguments={},
            )

        # 6. Specific Transaction Search
        if any(k in msg for k in ["tìm", "khoản", "search", "giao dịch", "grab", "amazon", "apple"]):
            # Extract possible query
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
