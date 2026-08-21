import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from packages.agent.guardrails.input import InputGuardrail
from packages.agent.guardrails.output import OutputGuardrail
from packages.agent.providers import BaseLLMProvider, get_llm_provider
from packages.agent.runtime.executor import SafeToolExecutor
from packages.agent.runtime.planner import ExecutionPlan, IntentPlanner
from packages.agent.tools import ToolContext, ToolRegistry, create_default_tool_registry
from packages.agent.memory import session_memory
from packages.agent.rag import financial_rag
from packages.connectors.email_dispatcher import EmailAlertDispatcher
from packages.data.schemas.alert import Alert, AlertType, AlertStatus
from packages.observability.logging import logger
from packages.observability.metrics import metrics_tracker


class AgentState(str, Enum):
    RECEIVED = "RECEIVED"
    CLASSIFIED = "CLASSIFIED"
    PLANNING = "PLANNING"
    POLICY_CHECK = "POLICY_CHECK"
    TOOL_EXECUTION = "TOOL_EXECUTION"
    EVIDENCE_CHECK = "EVIDENCE_CHECK"
    EMAIL_DISPATCH = "EMAIL_DISPATCH"
    RESPONSE_GENERATION = "RESPONSE_GENERATION"
    GROUNDING_REFLECTION = "GROUNDING_REFLECTION"
    SAFETY_CHECK = "SAFETY_CHECK"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ExecutionStep(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    step_name: str
    status: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    details: Dict[str, Any] = Field(default_factory=dict)


class AgentRunResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    run_id: str
    session_id: str
    user_message: str
    intent: str
    final_response: str
    tool_called: Optional[str] = None
    tool_result: Dict[str, Any] = Field(default_factory=dict)
    state: AgentState = AgentState.COMPLETED
    policy_allowed: bool = True
    grounding_verified: bool = True
    grounding_notes: str = "Grounding OK"
    email_dispatched: bool = False
    dispatched_email_id: Optional[str] = None
    steps: List[ExecutionStep] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AgentOrchestrator:
    """
    Coordinates the full Agentic Lifecycle:
    User Message → Input Guardrails → Intent Planning → Safe Tool Execution → Evidence Validation → Automated Email Notification → Grounding Reflection → LLM Synthesis → Output Guardrails
    """

    def __init__(
        self,
        registry: Optional[ToolRegistry] = None,
        llm_provider: Optional[BaseLLMProvider] = None,
    ):
        self.registry = registry or create_default_tool_registry()
        self.executor = SafeToolExecutor(self.registry)
        self.llm = llm_provider or get_llm_provider()

    @classmethod
    async def process(
        cls,
        user_message: str,
        session_id: str = "ses_default",
        account_id: str = "acc_main",
        user_email: str = "founder@wealify.io",
        language: str = "vi",
    ) -> AgentRunResult:
        instance = cls()
        return await instance.run(
            user_message=user_message,
            session_id=session_id,
            account_id=account_id,
            user_email=user_email,
            language=language,
        )

    async def run(
        self,
        user_message: str,
        session_id: str = "ses_default",
        account_id: str = "acc_main",

        user_email: str = "founder@wealify.io",
        language: str = "vi",
    ) -> AgentRunResult:
        run_id = f"run_{uuid.uuid4().hex[:10]}"
        steps: List[ExecutionStep] = []
        logger.info(f"[{run_id}] Agent Run Started: '{user_message}' (lang={language})")

        # 1. State: RECEIVED
        steps.append(ExecutionStep(step_name="RECEIVED", status="SUCCESS", details={"user_message": user_message, "language": language}))

        # 2. State: CLASSIFIED (Input Guardrail Check)
        is_safe, action, reason = InputGuardrail.validate_user_message(user_message)
        if not is_safe:
            logger.warning(f"[{run_id}] Blocked by Input Guardrail: {reason}")
            steps.append(ExecutionStep(step_name="POLICY_DENIED", status="BLOCKED", details={"reason": reason}))
            if language == "en":
                policy_text = (
                    "⚠️ **Financial Safety Policy (Policy Denied):**\n"
                    "Wealify Guardian operates in **Read-Only** mode to safeguard your financial assets. "
                    "The system is strictly not permitted to directly transfer money, modify balances, or contact banks on your behalf.\n\n"
                    "💡 **Recommendation:** You can perform this action directly within your banking application or the merchant's customer portal."
                )
            else:
                policy_text = (
                    "⚠️ **Chính sách an toàn tài chính (Policy Denied):**\n"
                    "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ an toàn tài sản của bạn. "
                    "Hệ thống không được phép trực tiếp chuyển tiền, thay đổi số dư hoặc liên hệ ngân hàng thay bạn.\n\n"
                    "💡 **Khuyến nghị:** Bạn có thể tự thực hiện thao tác này trực tiếp trên ứng dụng ngân hàng hoặc trang quản lý của nhà cung cấp."
                )
            return AgentRunResult(
                run_id=run_id,
                session_id=session_id,
                user_message=user_message,
                intent="DISALLOWED_MUTATION",
                final_response=policy_text,
                state=AgentState.COMPLETED,
                policy_allowed=False,
                grounding_verified=True,
                steps=steps,
            )

        steps.append(ExecutionStep(step_name="CLASSIFIED", status="SUCCESS", details={"safe": True}))

        # 3. State: PLANNING
        plan: ExecutionPlan = IntentPlanner.plan(user_message)
        steps.append(ExecutionStep(step_name="PLANNING", status="SUCCESS", details={"intent": plan.intent, "target_tool": plan.target_tool}))
        logger.info(f"[{run_id}] Plan generated: intent={plan.intent}, target_tool={plan.target_tool}")

        # 4. State: TOOL_EXECUTION
        tool_data: Dict[str, Any] = {}
        tool_name = plan.target_tool
        email_dispatched = False
        dispatched_email_id: Optional[str] = None

        if tool_name:
            context = ToolContext(session_id=session_id, account_id=account_id)
            tool_res = await self.executor.execute(tool_name, context, plan.arguments)
            if tool_res.success:
                tool_data = tool_res.data
                steps.append(ExecutionStep(step_name="TOOL_EXECUTION", status="SUCCESS", details={"tool": tool_name, "execution_time_ms": tool_res.execution_time_ms}))

                # Prepare draft email data for User Preview & Confirmation (HITL safety)
                steps.append(ExecutionStep(step_name="DRAFT_PREPARATION", status="SUCCESS", details={"preview_ready": True}))
            else:
                logger.warning(f"[{run_id}] Tool {tool_name} returned error: {tool_res.error}")
                tool_data = {"error": tool_res.error}
                steps.append(ExecutionStep(step_name="TOOL_EXECUTION", status="FAILED", details={"tool": tool_name, "error": tool_res.error}))


        # 5. State: EVIDENCE_CHECK & RAG RETRIEVAL
        rag_context = financial_rag.get_grounding_context(user_message)
        conv_context = session_memory.get_formatted_context(session_id)
        steps.append(ExecutionStep(step_name="EVIDENCE_CHECK", status="SUCCESS", details={"evidence_count": len(tool_data), "rag_active": bool(rag_context)}))

        # 6. State: RESPONSE_GENERATION (with Memory Context & RAG Grounding & Language)
        enriched_prompt = user_message
        if conv_context:
            enriched_prompt = f"{conv_context}\n\n{enriched_prompt}"
        if rag_context:
            enriched_prompt = f"{enriched_prompt}\n\n{rag_context}"

        llm_response = await self.llm.generate(
            prompt=enriched_prompt,
            context={
                "intent": plan.intent,
                "tool_name": tool_name,
                "tool_result": tool_data,
                "rag_context": rag_context,
                "email_dispatched": email_dispatched,
                "recipient_email": user_email,
                "language": language,
            },
        )
        metrics_tracker.record_tokens(llm_response.prompt_tokens, llm_response.completion_tokens)
        steps.append(ExecutionStep(step_name="RESPONSE_GENERATION", status="SUCCESS", details={"tokens": llm_response.completion_tokens}))

        # 7. State: GROUNDING_REFLECTION (Self-Reflection Check)
        grounding_ok, grounding_msg = OutputGuardrail.verify_grounding(llm_response.content, tool_data, plan.intent)
        steps.append(ExecutionStep(step_name="GROUNDING_REFLECTION", status="SUCCESS" if grounding_ok else "WARNING", details={"message": grounding_msg}))

        # 8. State: SAFETY_CHECK (Output Guardrail)
        _, sanitized_text = OutputGuardrail.sanitize_output(llm_response.content)
        steps.append(ExecutionStep(step_name="SAFETY_CHECK", status="SUCCESS", details={"sanitized": True}))

        # Record turns to Session Memory
        session_memory.add_message(session_id=session_id, role="user", content=user_message, intent=plan.intent)
        session_memory.add_message(session_id=session_id, role="assistant", content=sanitized_text, intent=plan.intent, tool_called=tool_name)

        # 9. State: COMPLETED
        steps.append(ExecutionStep(step_name="COMPLETED", status="SUCCESS"))
        logger.info(f"[{run_id}] Agent Run Completed Successfully (Email Dispatched: {email_dispatched}).")

        return AgentRunResult(
            run_id=run_id,
            session_id=session_id,
            user_message=user_message,
            intent=plan.intent,
            final_response=sanitized_text,
            tool_called=tool_name,
            tool_result=tool_data,
            state=AgentState.COMPLETED,
            policy_allowed=True,
            grounding_verified=grounding_ok,
            grounding_notes=grounding_msg,
            email_dispatched=email_dispatched,
            dispatched_email_id=dispatched_email_id,
            steps=steps,
        )
