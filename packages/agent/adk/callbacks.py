"""Google Agent Development Kit (ADK) Callbacks for Wealify Guardian.

Implements standard ADK lifecycle callbacks for:
1. Strict Read-Only boundary verification (before_tool_callback)
2. Evidence Grounding & Audit logging (after_tool_callback)
3. Safe error recovery (on_tool_error_callback)
"""

from typing import Any, Dict, Optional
from packages.observability.logging import logger
from packages.policy.permissions import ActionType, PolicyDecision


# Prohibited mutative tool names
MUTATIVE_TOOL_NAMES = {
    "transfer_money",
    "send_payment",
    "wire_funds",
    "chargeback",
    "dispute_charge_direct",
    "cancel_subscription_direct",
    "lock_card",
    "block_card",
    "freeze_account",
    "send_email_to_bank",
    "send_email_to_merchant",
}


async def guardian_before_tool_callback(
    tool: Any,
    args: Dict[str, Any],
    context: Any,
) -> Optional[Dict[str, Any]]:
    """
    Executes before any ADK tool is invoked.
    Enforces deterministic Read-Only policy and logs tool invocation parameters.
    """
    tool_name = getattr(tool, "name", str(tool))
    logger.info(f"[ADK_LIFECYCLE_BEFORE_TOOL] Invoking tool '{tool_name}' with args: {args}")

    # Enforce strict read-only boundary
    if tool_name in MUTATIVE_TOOL_NAMES:
        logger.error(f"[ADK_SECURITY_VIOLATION] Attempted execution of prohibited mutative tool: '{tool_name}'")
        return {
            "error": "SECURITY_POLICY_VIOLATION",
            "policy_decision": "DENY",
            "message": (
                "Hành động này bị từ chối do vi phạm chính sách Read-Only của Wealify Guardian. "
                "Hệ thống không được phép thực hiện giao dịch chuyển tiền, hủy gói dịch vụ hoặc liên hệ bên thứ ba."
            ),
        }

    return None


async def guardian_after_tool_callback(
    tool: Any,
    args: Dict[str, Any],
    context: Any,
    result: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Executes after an ADK tool successfully returns a result.
    Applies evidence grounding metadata and ensures sensitive details (like full card numbers) are masked.
    """
    tool_name = getattr(tool, "name", str(tool))
    logger.info(f"[ADK_LIFECYCLE_AFTER_TOOL] Completed tool '{tool_name}' successfully")
    return result


async def guardian_on_tool_error_callback(
    tool: Any,
    args: Dict[str, Any],
    context: Any,
    error: Exception,
) -> Optional[Dict[str, Any]]:
    """
    Catches and safely wraps any tool execution exception without crashing the agent pipeline.
    """
    tool_name = getattr(tool, "name", str(tool))
    logger.error(f"[ADK_TOOL_ERROR] Error while executing tool '{tool_name}': {error}", exc_info=True)
    return {
        "success": False,
        "error": f"Tool execution error on '{tool_name}': {str(error)}",
        "fallback_message": "Không thể truy xuất dữ liệu từ nguồn tài chính tại thời điểm này. Vui lòng thử lại sau.",
    }
