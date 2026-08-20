import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.anomaly.duplicate_detector import DuplicateDetector


class FindDuplicatesTool(BaseTool):
    name = "find_duplicates"
    description = "Scan transactions to identify duplicate charges and unexpected multiple billings."
    action_type = ActionType.DETECT_DUPLICATES

    def __init__(self, source: MockTransactionSource = None):
        self.source = source or MockTransactionSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        time_window = arguments.get("time_window_hours", 48)
        txs = await self.source.get_transactions(account_id=context.account_id)

        raw_dups = DuplicateDetector.find_duplicates(txs, time_window_hours=time_window)

        results = []
        for tx1, tx2, alert in raw_dups:
            results.append({
                "merchant": tx1.merchant_normalized or tx1.merchant_raw,
                "amount": tx1.amount,
                "transaction_1_id": tx1.id,
                "transaction_2_id": tx2.id,
                "status": alert.status.value,
                "confidence": alert.confidence,
                "confidence_label": alert.confidence_label,
                "reason": alert.reason,
            })

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={"duplicates": results, "count": len(results)},
            execution_time_ms=round(duration, 2),
        )
