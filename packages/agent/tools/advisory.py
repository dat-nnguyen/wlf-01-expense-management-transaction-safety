import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.advisory.business_advisor import BusinessAdvisor
from packages.financial.reconciliation.payout_radar import PayoutRadar


class AnalyzeBusinessHealthTool(BaseTool):
    name = "analyze_business_health"
    description = "Analyze business financial health, Unit Economics, Ad Spend on Virtual Cards vs Payouts, burn rate, and profit/loss advisory."
    action_type = ActionType.ANALYZE_BUSINESS_HEALTH

    def __init__(
        self,
        tx_source: MockTransactionSource = None,
        email_source: MockEmailSource = None,
    ):
        self.tx_source = tx_source or MockTransactionSource()
        self.email_source = email_source or MockEmailSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        transactions = await self.tx_source.get_transactions(account_id=context.account_id)
        emails = await self.email_source.get_emails()

        payout_alerts = PayoutRadar.detect_overdue_payouts(
            payout_emails=emails,
            account_txs=transactions,
        )

        health_report = BusinessAdvisor.analyze_health(
            account_id=context.account_id,
            transactions=transactions,
            payout_alerts=payout_alerts,
        )

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={"health_report": health_report.model_dump(mode="json")},
            execution_time_ms=round(duration, 2),
        )
