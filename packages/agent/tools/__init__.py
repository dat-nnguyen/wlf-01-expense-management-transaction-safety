from packages.agent.tools.base import BaseTool, ToolContext, ToolResult, ToolRegistry
from packages.agent.tools.transactions import SearchTransactionsTool, GetTransactionDetailsTool
from packages.agent.tools.reconciliation import ReconcileTransactionsTool
from packages.agent.tools.duplicates import FindDuplicatesTool
from packages.agent.tools.subscriptions import FindSubscriptionsTool
from packages.agent.tools.emails import SearchEmailsTool
from packages.agent.tools.reports import GenerateExpenseReportTool


def create_default_tool_registry() -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(SearchTransactionsTool())
    registry.register(GetTransactionDetailsTool())
    registry.register(ReconcileTransactionsTool())
    registry.register(FindDuplicatesTool())
    registry.register(FindSubscriptionsTool())
    registry.register(SearchEmailsTool())
    registry.register(GenerateExpenseReportTool())
    return registry


__all__ = [
    "BaseTool",
    "ToolContext",
    "ToolResult",
    "ToolRegistry",
    "SearchTransactionsTool",
    "GetTransactionDetailsTool",
    "ReconcileTransactionsTool",
    "FindDuplicatesTool",
    "FindSubscriptionsTool",
    "SearchEmailsTool",
    "GenerateExpenseReportTool",
    "create_default_tool_registry",
]
