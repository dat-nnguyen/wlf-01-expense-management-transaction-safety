import re
from typing import Optional, Tuple
from packages.policy.permissions import ActionType

DISALLOWED_INPUT_PATTERNS = [
    # 1. Money Transfer & Direct Payment
    (
        r"(?:hãy\s+|vui lòng\s+|tự\s+|hộ\s+)?(?:chuyển|bắn|gửi|rút|nạp|pay|transfer|send|wire)\s+.*(?:tiền|\$|\d+|sang|tới|vào|cho|tài khoản|stk|account|wallet|ví)",
        ActionType.TRANSFER_MONEY,
    ),
    (
        r"(?:chuyển|transfer|send|wire)\s+\$?\d+",
        ActionType.TRANSFER_MONEY,
    ),
    # 2. Cancel Subscriptions
    (
        r"(?:hãy\s+|tự\s+|vui lòng\s+)?(?:huỷ|hủy|dừng|ngắt|cancel|unsubscribe)\s+(?:subscription|gói|dịch vụ|membership|netflix|adobe|spotify)",
        ActionType.CANCEL_SUBSCRIPTION,
    ),
    # 3. Direct Chargeback / Immediate Refund
    (
        r"chargeback|đòi tiền lại ngay|tự hoàn tiền trực tiếp|tự động hoàn tiền",
        ActionType.CHARGEBACK,
    ),
    # 4. Lock / Freeze / Block Card
    (
        r"(?:hãy\s+|tự\s+|vui lòng\s+)?(?:khóa|khoá|block|freeze|lock)\s+thẻ|lock\s+card|block\s+card",
        ActionType.LOCK_CARD,
    ),
    # 5. Direct Email Dispatch To Bank
    (
        r"gửi\s+email\s+(?:khiếu nại\s+)?cho\s+(?:ngân hàng|bank)|email\s+to\s+bank",
        ActionType.SEND_EMAIL_TO_BANK,
    ),
    # 6. Direct Email Dispatch To Merchant
    (
        r"gửi\s+email\s+(?:khiếu nại\s+)?cho\s+(?:merchant|người bán|netflix|amazon|adobe)|email\s+to\s+merchant",
        ActionType.SEND_EMAIL_TO_MERCHANT,
    ),
]


class InputGuardrail:
    """Evaluates user input to detect intent attempting prohibited mutating actions."""

    @staticmethod
    def validate_user_message(message: str) -> Tuple[bool, Optional[ActionType], str]:
        cleaned = message.lower().strip()

        # If user is asking to verify/check a screenshot or claim, this is a safety inquiry, not a mutation
        is_verification = any(k in cleaned for k in [
            "gửi ảnh", "ảnh", "kiểm tra", "xác minh", "xác thực", "có thật không",
            "nói wealify đã chuyển", "nói đã chuyển", "thư cảnh báo", "tại sao", "lý do"
        ])
        is_imperative_transfer = bool(
            re.search(r"^(?:hãy\s+|vui lòng\s+|tự\s+|hộ\s+)?(?:chuyển|bắn|gửi|rút|nạp|pay|transfer|send|wire)\s+\$?\d+", cleaned, re.IGNORECASE)
            or re.search(r"^(?:chuyển|transfer|send)\s+\$?\d+\s+(?:cho|tới|vào|sang)", cleaned, re.IGNORECASE)
        )

        if is_verification and not is_imperative_transfer:
            return True, None, "Input is an informational verification inquiry."

        for pattern, action in DISALLOWED_INPUT_PATTERNS:
            if re.search(pattern, cleaned, re.IGNORECASE):
                return False, action, f"Hành động yêu cầu '{action.value}' thuộc ranh giới bị nghiêm cấm theo chính sách an toàn (Read-Only Guard)."

        return True, None, "Input passed guardrail check."
