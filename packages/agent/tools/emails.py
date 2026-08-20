import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.connectors.mock.mock_sources import MockEmailSource


class SearchEmailsTool(BaseTool):
    name = "search_emails"
    description = "Search read-only email evidence such as subscription invoices, receipts, and order confirmations."
    action_type = ActionType.READ_EMAIL

    def __init__(self, source: MockEmailSource = None):
        self.source = source or MockEmailSource()

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        query = arguments.get("query")
        limit = arguments.get("limit", 20)

        emails = await self.source.get_emails(query=query, limit=limit)
        duration = (time.perf_counter() - start) * 1000

        return ToolResult(
            success=True,
            data={"emails": [e.model_dump(mode="json") for e in emails]},
            execution_time_ms=round(duration, 2),
        )
