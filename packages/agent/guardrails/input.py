import re
from typing import Optional, Tuple
from packages.policy.permissions import ActionType

DISALLOWED_INPUT_PATTERNS = [
    (r"chuyển\s+(\$?\d+|tiền|khoản|qua)|transfer|gửi tiền vào tk|send \$", ActionType.TRANSFER_MONEY),
    (r"huỷ subscription|hủy gói|cancel subscription|cancel netflix|huỷ dịch vụ|hủy dịch vụ", ActionType.CANCEL_SUBSCRIPTION),
    (r"chargeback|đòi tiền lại|yêu cầu hoàn tiền trực tiếp", ActionType.CHARGEBACK),
    (r"khóa thẻ|khoá thẻ|lock card|block card", ActionType.LOCK_CARD),
    (r"gửi email cho ngân hàng|email to bank", ActionType.SEND_EMAIL_TO_BANK),
    (r"gửi email cho merchant|email to merchant", ActionType.SEND_EMAIL_TO_MERCHANT),
]


class InputGuardrail:
    """Evaluates user input to detect intent attempting prohibited actions."""

    @staticmethod
    def validate_user_message(message: str) -> Tuple[bool, Optional[ActionType], str]:
        cleaned = message.lower().strip()
        for pattern, action in DISALLOWED_INPUT_PATTERNS:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return False, action, f"Hành động yêu cầu '{action.value}' thuộc ranh giới bị nghiêm cấm theo chính sách an toàn."
        return True, None, "Input passed guardrail check."
