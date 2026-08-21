from packages.agent.tools.base import BaseTool, ToolContext, ToolResult, ToolRegistry
from packages.agent.tools.duplicates import FindDuplicatesTool
from packages.agent.tools.subscriptions import FindSubscriptionsTool
from packages.agent.tools.reconciliation import ReconcileTransactionsTool
from packages.agent.tools.transactions import SearchTransactionsTool, GetTransactionTool, GetTransactionDetailsTool
from packages.agent.tools.reports import GenerateExpenseReportTool
from packages.agent.tools.emails import SearchEmailsTool
from packages.agent.tools.payouts import DetectOverduePayoutsTool
from packages.agent.tools.advisory import AnalyzeBusinessHealthTool
from packages.agent.tools.authenticity import VerifyTransactionAuthenticityTool
from packages.agent.tools.surge import DetectSpendingSurgesTool
from typing import Dict, List, Optional


def create_default_tool_registry() -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(FindDuplicatesTool())
    registry.register(FindSubscriptionsTool())
    registry.register(ReconcileTransactionsTool())
    registry.register(SearchTransactionsTool())
    registry.register(GetTransactionDetailsTool())
    registry.register(GenerateExpenseReportTool())
    registry.register(SearchEmailsTool())
    registry.register(DetectOverduePayoutsTool())
    registry.register(AnalyzeBusinessHealthTool())
    registry.register(VerifyTransactionAuthenticityTool())
    registry.register(DetectSpendingSurgesTool())
    return registry


__all__ = [
    "BaseTool",
    "ToolContext",
    "ToolResult",
    "ToolRegistry",
    "FindDuplicatesTool",
    "FindSubscriptionsTool",
    "ReconcileTransactionsTool",
    "SearchTransactionsTool",
    "GetTransactionTool",
    "GetTransactionDetailsTool",
    "GenerateExpenseReportTool",
    "SearchEmailsTool",
    "DetectOverduePayoutsTool",
    "AnalyzeBusinessHealthTool",
    "VerifyTransactionAuthenticityTool",
    "DetectSpendingSurgesTool",
    "create_default_tool_registry",
]

