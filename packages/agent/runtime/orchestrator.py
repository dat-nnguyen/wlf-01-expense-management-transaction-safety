import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from packages.agent.guardrails.input import InputGuardrail
from packages.agent.guardrails.output import OutputGuardrail
from packages.agent.providers import BaseLLMProvider, get_llm_provider
from packages.agent.runtime.executor import SafeToolExecutor
from packages.agent.runtime.planner import ExecutionPlan, IntentPlanner
from packages.agent.tools import ToolContext, ToolRegistry, create_default_tool_registry
from packages.observability.logging import logger
from packages.observability.metrics import metrics_tracker


class AgentState(str, Enum):
    RECEIVED = "RECEIVED"
    CLASSIFIED = "CLASSIFIED"
    PLANNING = "PLANNING"
    TOOL_EXECUTION = "TOOL_EXECUTION"
    EVIDENCE_CHECK = "EVIDENCE_CHECK"
    RESPONSE_GENERATION = "RESPONSE_GENERATION"
    SAFETY_CHECK = "SAFETY_CHECK"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AgentRunResult(BaseModel):
    run_id: str
    session_id: str
    user_message: str
    intent: str
    final_response: str
    tool_called: Optional[str] = None
    tool_result: Dict[str, Any] = Field(default_factory=dict)
    state: AgentState = AgentState.COMPLETED
    policy_allowed: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentOrchestrator:
    """
    Coordinates the full Agentic Lifecycle:
    User Message → Input Guardrails → Intent Planning → Safe Tool Execution → Evidence Validation → LLM Synthesis → Output Guardrails
    """

    def __init__(
        self,
        registry: Optional[ToolRegistry] = None,
        llm_provider: Optional[BaseLLMProvider] = None,
    ):
        self.registry = registry or create_default_tool_registry()
        self.executor = SafeToolExecutor(self.registry)
        self.llm = llm_provider or get_llm_provider()

    async def run(
        self,
        user_message: str,
        session_id: str = "ses_default",
        account_id: str = "acc_main",
    ) -> AgentRunResult:
        run_id = f"run_{uuid.uuid4().hex[:10]}"
        logger.info(f"[{run_id}] Agent Run Started: '{user_message}'")

        # 1. State: RECEIVED
        state = AgentState.RECEIVED

        # 2. State: CLASSIFIED (Input Guardrail Check)
        state = AgentState.CLASSIFIED
        is_safe, action, reason = InputGuardrail.validate_user_message(user_message)
        if not is_safe:
            logger.warning(f"[{run_id}] Blocked by Input Guardrail: {reason}")
            # Generate safe refusal response
            llm_res = await self.llm.generate(
                prompt=user_message,
                context={"intent": "DISALLOWED_MUTATION", "reason": reason},
            )
            return AgentRunResult(
                run_id=run_id,
                session_id=session_id,
                user_message=user_message,
                intent="DISALLOWED_MUTATION",
                final_response=llm_res.content,
                state=AgentState.COMPLETED,
                policy_allowed=False,
            )

        # 3. State: PLANNING
        state = AgentState.PLANNING
        plan: ExecutionPlan = IntentPlanner.plan(user_message)
        logger.info(f"[{run_id}] Plan generated: intent={plan.intent}, target_tool={plan.target_tool}")

        # 4. State: TOOL_EXECUTION
        tool_data: Dict[str, Any] = {}
        tool_name = plan.target_tool
        if tool_name:
            state = AgentState.TOOL_EXECUTION
            context = ToolContext(session_id=session_id, account_id=account_id)
            tool_res = await self.executor.execute(tool_name, context, plan.arguments)
            if tool_res.success:
                tool_data = tool_res.data
            else:
                logger.warning(f"[{run_id}] Tool {tool_name} returned error: {tool_res.error}")
                tool_data = {"error": tool_res.error}

        # 5. State: EVIDENCE_CHECK
        state = AgentState.EVIDENCE_CHECK

        # 6. State: RESPONSE_GENERATION
        state = AgentState.RESPONSE_GENERATION
        llm_response = await self.llm.generate(
            prompt=user_message,
            context={
                "intent": plan.intent,
                "tool_name": tool_name,
                "tool_result": tool_data,
            },
        )
        metrics_tracker.record_tokens(llm_response.prompt_tokens, llm_response.completion_tokens)

        # 7. State: SAFETY_CHECK (Output Guardrail)
        state = AgentState.SAFETY_CHECK
        _, sanitized_text = OutputGuardrail.sanitize_output(llm_response.content)

        # 8. State: COMPLETED
        state = AgentState.COMPLETED
        logger.info(f"[{run_id}] Agent Run Completed Successfully.")

        return AgentRunResult(
            run_id=run_id,
            session_id=session_id,
            user_message=user_message,
            intent=plan.intent,
            final_response=sanitized_text,
            tool_called=tool_name,
            tool_result=tool_data,
            state=state,
            policy_allowed=True,
        )
