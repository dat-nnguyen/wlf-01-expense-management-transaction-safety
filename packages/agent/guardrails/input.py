import re
from typing import Optional, Tuple
from packages.policy.permissions import ActionType

DISALLOWED_INPUT_PATTERNS = [
    (r"(?:hãy\s+|vui lòng\s+|tự\s+)?(?:chuyển|transfer|send)\s+(?:tiền\s+)?(?:\$?\d+|khoản|qua)?(?:\s*tiền)?\s*(?:cho|tới|vào|sang|to)", ActionType.TRANSFER_MONEY),
    (r"(?:hãy\s+|tự\s+)?(?:huỷ|hủy)\s+(?:subscription|gói|dịch vụ|netflix|adobe)|cancel\s+(?:subscription|membership|netflix|adobe)", ActionType.CANCEL_SUBSCRIPTION),
    (r"chargeback|đòi tiền lại ngay|tự hoàn tiền trực tiếp", ActionType.CHARGEBACK),
    (r"(?:hãy\s+|tự\s+)?(?:khóa|khoá)\s+thẻ|lock\s+card|block\s+card", ActionType.LOCK_CARD),
    (r"gửi\s+email\s+(?:khiếu nại\s+)?cho\s+(?:ngân hàng|bank)|email\s+to\s+bank", ActionType.SEND_EMAIL_TO_BANK),
    (r"gửi\s+email\s+(?:khiếu nại\s+)?cho\s+(?:merchant|người bán|netflix|amazon|adobe)|email\s+to\s+merchant", ActionType.SEND_EMAIL_TO_MERCHANT),
]


class InputGuardrail:
    """Evaluates user input to detect intent attempting prohibited mutating actions."""

    @staticmethod
    def validate_user_message(message: str) -> Tuple[bool, Optional[ActionType], str]:
        cleaned = message.lower().strip()

        # If user is asking to verify/check a screenshot or claim, this is a safety inquiry, not a mutation
        if any(k in cleaned for k in [
            "gửi ảnh", "ảnh", "kiểm tra", "xác minh", "xác thực", "có thật không",
            "nói wealify đã chuyển", "nói đã chuyển", "thư cảnh báo", "tại sao"
        ]):
            return True, None, "Input is an informational verification inquiry."

        for pattern, action in DISALLOWED_INPUT_PATTERNS:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return False, action, f"Hành động yêu cầu '{action.value}' thuộc ranh giới bị nghiêm cấm theo chính sách an toàn."

        return True, None, "Input passed guardrail check."
