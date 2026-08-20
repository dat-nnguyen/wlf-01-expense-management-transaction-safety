from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from packages.policy.permissions import ActionType


class ToolContext(BaseModel):
    user_id: str = "usr_default"
    session_id: str = "ses_default"
    account_id: str = "acc_main"


class ToolResult(BaseModel):
    success: bool = True
    data: Dict[str, Any] = Field(default_factory=dict)
    error: Optional[str] = None
    execution_time_ms: float = 0.0


class BaseTool(ABC):
    name: str
    description: str
    action_type: ActionType

    @abstractmethod
    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        pass


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, str]]:
        return [
            {"name": t.name, "description": t.description, "action_type": t.action_type.value}
            for t in self._tools.values()
        ]
