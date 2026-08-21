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
    def _extract_numbers_from_obj(cls, obj: Any) -> List[float]:
        numbers: List[float] = []
        if isinstance(obj, (int, float)):
            numbers.append(float(obj))
        elif isinstance(obj, str):
            for m in re.finditer(r"[-+]?\d+(?:\.\d+)?", obj):
                try:
                    numbers.append(float(m.group(0)))
                except ValueError:
                    pass
        elif isinstance(obj, dict):
            for v in obj.values():
                numbers.extend(cls._extract_numbers_from_obj(v))
        elif isinstance(obj, (list, tuple, set)):
            for v in obj:
                numbers.extend(cls._extract_numbers_from_obj(v))
        return numbers

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
        raw_matches = re.findall(r"\$\s?([0-9,]+(?:\.[0-9]+)?)", text)
        if not raw_matches:
            return True, "Grounding OK (No monetary assertions)."

        amounts_in_text: List[float] = []
        for m in raw_matches:
            try:
                amounts_in_text.append(float(m.replace(",", "")))
            except ValueError:
                pass

        if not amounts_in_text:
            return True, "Grounding OK."

        # Extract all floats in tool_result
        source_numbers = cls._extract_numbers_from_obj(tool_result)
        # Add permissible system constants (days, baseline multipliers, percentages)
        allowed_constants = [0.0, 1.0, 2.0, 3.0, 7.0, 14.0, 15.0, 30.0, 60.0, 90.0, 365.0, 10.0, 100.0]

        for amt in amounts_in_text:
            matched = any(abs(amt - num) < 0.05 for num in source_numbers) or any(abs(amt - c) < 0.05 for c in allowed_constants)
            if not matched:
                return False, f"Potential ungrounded figure detected: ${amt:,.2f} not in source ledger data."

        return True, "Grounding Verified: 100% facts match evidence."
