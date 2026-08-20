import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar


class FindSubscriptionsTool(BaseTool):
    name = "find_subscriptions"
    description = "Detect recurring subscription charges, price increases, and calculate annual recurring expenses."
    action_type = ActionType.DETECT_SUBSCRIPTIONS

    def __init__(self, source: MockTransactionSource = None):
        self.source = source or MockTransactionSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        txs = await self.source.get_transactions(account_id=context.account_id)
        subs, alerts = SubscriptionRadar.detect_subscriptions(txs)

        duration = (time.perf_counter() - start) * 1000
        return ToolResult(
            success=True,
            data={
                "subscriptions": [
                    {
                        "id": s.id,
                        "merchant": s.merchant,
                        "amount": s.amount,
                        "cadence": s.cadence.value,
                        "annual_cost": s.annual_cost,
                        "next_billing": s.next_billing_estimated.strftime("%Y-%m-%d"),
                        "price_changed": s.price_changed,
                        "previous_amount": s.previous_amount,
                    }
                    for s in subs
                ],
                "price_alerts": [a.model_dump(mode="json") for a in alerts],
            },
            execution_time_ms=round(duration, 2),
        )
