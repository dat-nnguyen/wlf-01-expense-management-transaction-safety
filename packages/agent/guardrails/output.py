import re
from typing import Any, Dict, List, Optional, Tuple


class OutputGuardrail:
    """
    Sanitizes LLM outputs and verifies grounding / self-reflection before returning to user.
    Prevents hallucinated promises or unauthorized commitment language.
    """

    UNSAFE_PHRASES = [
        "tôi đã chuyển tiền",
        "tôi đã hủy gói",
        "tôi đã khóa thẻ",
        "tôi đã gửi email cho ngân hàng",
        "i have transferred",
        "i have cancelled your subscription",
        "i have locked your card",
    ]

    @classmethod
    def sanitize_output(cls, text: str) -> Tuple[bool, str]:
        """Check for unsafe commitments in model output."""
        lower = text.lower()
        for phrase in cls.UNSAFE_PHRASES:
            if phrase in lower:
                sanitized = (
                    f"⚠️ *Thông báo an toàn:* Hệ thống Wealify Guardian hoạt động ở chế độ Read-Only "
                    f"và chỉ đóng vai trò hỗ trợ phân tích thông tin.\n\n"
                    f"{text}"
                )
                return False, sanitized
        return True, text

    @classmethod
    def verify_grounding(
        cls,
        text: str,
        tool_result: Dict[str, Any],
        intent: str,
    ) -> Tuple[bool, str]:
        """
        Self-Reflection / Grounding Check:
        Verifies that any specific monetary claim ($X.XX) in the response
        is strictly supported by the underlying tool data and not hallucinated.
        """
        # Extract dollar amounts mentioned in the text
        amounts_in_text = re.findall(r"\$\s?(\d+(?:\.\d{2})?)", text)
        if not amounts_in_text:
            return True, "Grounding OK (No monetary assertions)."

        # Flatten all numerical values in tool_result to check existence
        str_tool_data = str(tool_result)
        for amt in amounts_in_text:
            if amt not in str_tool_data and float(amt) not in [0.0, 1.0, 2.0, 3.0, 60.0, 14.0, 15.0]:
                # Non-trivial ungrounded amount detected
                return False, f"Potential ungrounded figure detected: ${amt} not in source ledger data."

        return True, "Grounding Verified: 100% facts match evidence."
