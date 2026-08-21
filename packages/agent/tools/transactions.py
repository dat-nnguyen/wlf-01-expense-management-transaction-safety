import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource


class SearchTransactionsTool(BaseTool):
    name = "search_transactions"
    description = "Search and list financial transactions by merchant name, category, or account ID."
    action_type = ActionType.READ_TRANSACTION

    def __init__(self, source: MockTransactionSource = None):
        self.source = source or MockTransactionSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        query = arguments.get("query", "").lower().strip()
        limit = arguments.get("limit", 15)

        acc_id = context.account_id or "acc_main"
        txs = await self.source.get_transactions(account_id=acc_id, limit=limit)
        if query:
            clean_q = query.lower()
            for stop in ["kiểm tra", "các khoản", "giao dịch", "gần đây", "của tôi", "tìm", "khoản", "recent", "transactions", "cho tôi", "xem", "quét", "lịch sử", "history", "all"]:
                clean_q = clean_q.replace(stop, "")
            clean_q = clean_q.strip()
            if clean_q:
                txs = [t for t in txs if clean_q in t.merchant_normalized.lower() or clean_q in t.merchant_raw.lower()]

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={"transactions": [t.model_dump(mode="json") for t in txs]},
            execution_time_ms=round(duration, 2),
        )


class GetTransactionDetailsTool(BaseTool):
    name = "get_transaction_details"
    description = "Retrieve detailed information and linked evidence for a specific transaction ID."
    action_type = ActionType.READ_TRANSACTION

    def __init__(self, source: MockTransactionSource = None):
        self.source = source or MockTransactionSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        tx_id = arguments.get("transaction_id")
        txs = await self.source.get_transactions(account_id=context.account_id)
        matched = next((t for t in txs if t.id == tx_id), None)

        duration = (time.perf_counter() - start) * 1000
        if not matched:
            return ToolResult(
                success=False,
                error=f"Transaction '{tx_id}' not found.",
                execution_time_ms=round(duration, 2),
            )
        return ToolResult(
            success=True,
            data={"transaction": matched.model_dump(mode="json")},
            execution_time_ms=round(duration, 2),
        )


# Alias
GetTransactionTool = GetTransactionDetailsTool
