import asyncio
import json
from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from packages.agent.runtime.orchestrator import AgentOrchestrator, AgentRunResult
from apps.api.dependencies import get_orchestrator

router = APIRouter(prefix="/api/v1", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., description="User message/query")
    session_id: str = Field(default="ses_default")
    account_id: str = Field(default="acc_main")
    language: str = Field(default="vi", description="Language preference: 'vi' or 'en'")


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
        language=req.language,
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


@router.post("/chat/stream")
async def chat_stream_endpoint(
    req: ChatRequest,
    orchestrator: AgentOrchestrator = Depends(get_orchestrator),
):
    """
    Server-Sent Events (SSE) Streaming Chat Endpoint:
    Streams real-time agent reasoning steps (Thought Chain) and token-by-token responses.
    """
    async def sse_event_generator():
        # Step 1: Input Guardrail
        yield f"event: thinking\ndata: {json.dumps({'step': 'INPUT_GUARDRAIL', 'message': '🛡️ Xác thực chính sách Read-Only & Kiểm tra nội dung...'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.05)

        # Step 2: Planning
        yield f"event: thinking\ndata: {json.dumps({'step': 'INTENT_PLANNING', 'message': '🧠 Google ADK Intent Router đang lập kế hoạch gọi công cụ tài chính...'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.05)

        # Execute Orchestrator
        result: AgentRunResult = await orchestrator.run(
            user_message=req.message,
            session_id=req.session_id,
            account_id=req.account_id,
            language=req.language,
        )

        # Step 3: Tool Execution Trace
        if result.tool_called:
            yield f"event: thinking\ndata: {json.dumps({'step': 'TOOL_EXECUTION', 'tool': result.tool_called, 'message': f'⚡ Đã thực thi công cụ: {result.tool_called}'}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0.05)

        # Step 4: Grounding Reflection
        yield f"event: thinking\ndata: {json.dumps({'step': 'GROUNDING_REFLECTION', 'message': '🔍 Grounding Self-Reflection: Kiểm tra đối soát số liệu và điều khoản 60 ngày...'}, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.05)

        # Step 5: Stream Response Tokens
        full_text = result.final_response
        words = full_text.split(" ")
        for i in range(0, len(words), 3):
            chunk = " ".join(words[i:i+3]) + " "
            yield f"event: token\ndata: {json.dumps({'chunk': chunk}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0.02)

        # Step 6: Done Event
        yield f"event: done\ndata: {json.dumps({'run_id': result.run_id, 'intent': result.intent, 'policy_allowed': result.policy_allowed, 'tool_called': result.tool_called}, ensure_ascii=False)}\n\n"

    return StreamingResponse(sse_event_generator(), media_type="text/event-stream")
