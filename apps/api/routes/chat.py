from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from packages.agent.runtime.orchestrator import AgentOrchestrator, AgentRunResult
from apps.api.dependencies import get_orchestrator

router = APIRouter(prefix="/api/v1", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., example="Khoản Netflix $9.99 này là gì?")
    session_id: str = Field(default="ses_default")
    account_id: str = Field(default="acc_main")


class ChatResponse(BaseModel):
    run_id: str
    session_id: str
    message: str
    intent: str
    response: str
    tool_called: Optional[str]
    tool_result: Dict[str, Any]
    policy_allowed: bool


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    orchestrator: AgentOrchestrator = Depends(get_orchestrator),
):
    result: AgentRunResult = await orchestrator.run(
        user_message=req.message,
        session_id=req.session_id,
        account_id=req.account_id,
    )
    return ChatResponse(
        run_id=result.run_id,
        session_id=result.session_id,
        message=result.user_message,
        intent=result.intent,
        response=result.final_response,
        tool_called=result.tool_called,
        tool_result=result.tool_result,
        policy_allowed=result.policy_allowed,
    )
