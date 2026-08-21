import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.anomaly.spending_surge import SpendingSurgeRadar


class DetectSpendingSurgesTool(BaseTool):
    name = "detect_spending_surges"
    description = (
        "Detect abnormal spending surges by comparing current period spending against historical baseline, "
        "breaking down categories and explaining root cause drivers."
    )
    action_type = ActionType.ANALYZE_BUSINESS_HEALTH

    def __init__(self, source: MockTransactionSource = None):
        self.source = source or MockTransactionSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        window_days = arguments.get("window_days", 7)
        txs = await self.source.get_transactions(account_id=context.account_id)

        report = SpendingSurgeRadar.detect_surges(
            transactions=txs,
            account_id=context.account_id,
            window_days=window_days,
        )

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data=report.model_dump(),
            execution_time_ms=round(duration, 2),
        )
