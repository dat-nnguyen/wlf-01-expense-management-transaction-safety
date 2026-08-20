import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.calculations.metrics import compute_monthly_summary


class GenerateExpenseReportTool(BaseTool):
    name = "generate_expense_report"
    description = "Calculate income, expenses, category breakdowns, and net cashflow summary."
    action_type = ActionType.CREATE_REPORT

    def __init__(self, source: MockTransactionSource = None):
        self.source = source or MockTransactionSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        month = arguments.get("month", "")
        txs = await self.source.get_transactions(account_id=context.account_id)
        summary = compute_monthly_summary(txs, month_str=month)

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={"summary": summary},
            execution_time_ms=round(duration, 2),
        )
