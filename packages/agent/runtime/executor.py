import time
from typing import Any, Dict, Optional
from packages.agent.tools.base import BaseTool, ToolContext, ToolRegistry, ToolResult
from packages.policy.action_policy import PolicyEngine, SecurityBoundaryViolation
from packages.observability.logging import logger
from packages.observability.metrics import metrics_tracker


class SafeToolExecutor:
    """
    Executes tools strictly guarded by the PolicyEngine.
    Enforces security boundary checks before invocation.
    """

    def __init__(self, registry: ToolRegistry):
        self.registry = registry

    async def execute(
        self,
        tool_name: str,
        context: ToolContext,
        arguments: Dict[str, Any],
    ) -> ToolResult:
        tool = self.registry.get(tool_name)
        if not tool:
            return ToolResult(
                success=False,
                error=f"Tool '{tool_name}' is not registered.",
            )

        # 1. Security & Policy Boundary Check
        try:
            PolicyEngine.enforce(tool.action_type, arguments)
        except SecurityBoundaryViolation as e:
            logger.warning(f"Security boundary blocked tool execution: {tool_name} -> {str(e)}")
            return ToolResult(
                success=False,
                error=str(e),
            )

        # 2. Execute Tool
        start_time = time.perf_counter()
        try:
            result = await tool.execute(context, arguments)
            duration_ms = (time.perf_counter() - start_time) * 1000
            metrics_tracker.record_tool_call(tool_name, duration_ms)
            return result
        except Exception as ex:
            logger.error(f"Execution failure in tool '{tool_name}': {str(ex)}", exc_info=True)
            return ToolResult(
                success=False,
                error=f"Tool execution failed: {str(ex)}",
            )
