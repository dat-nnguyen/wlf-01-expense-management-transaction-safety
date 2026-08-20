import re
from typing import Tuple

FORBIDDEN_OUTPUT_CLAIMS = [
    r"tôi đã chuyển tiền",
    r"tôi đã huỷ",
    r"tôi đã khoá thẻ",
    r"i transferred",
    r"i cancelled your",
    r"i locked your card",
]


class OutputGuardrail:
    """Verifies that the generated response does not hallucinate prohibited action execution."""

    @staticmethod
    def sanitize_output(response_text: str) -> Tuple[bool, str]:
        for pattern in FORBIDDEN_OUTPUT_CLAIMS:
            if re.search(pattern, response_text, re.IGNORECASE):
                # Replace with safe fallback
                safe_text = (
                    "⚠️ [Guardrail Filtered] Hệ thống đã phát hiện phản hồi vi phạm chính sách an toàn. "
                    "Wealify Guardian hoạt động ở chế độ chỉ đọc và không tự ý thao tác tài khoản của bạn."
                )
                return False, safe_text
        return True, response_text
