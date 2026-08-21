import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.reconciliation.payout_radar import PayoutRadar


class DetectOverduePayoutsTool(BaseTool):
    name = "detect_overdue_payouts"
    description = "Detect seller payout confirmations from Amazon, Stripe, Shopify, TikTok Shop where money has not arrived past SLA or 14-15+ days."
    action_type = ActionType.DETECT_OVERDUE_PAYOUTS

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

        alerts = PayoutRadar.detect_overdue_payouts(
            payout_emails=emails,
            account_txs=transactions,
        )

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={
                "overdue_payouts": [a.model_dump(mode="json") for a in alerts],
                "count": len(alerts),
            },
            execution_time_ms=round(duration, 2),
        )
