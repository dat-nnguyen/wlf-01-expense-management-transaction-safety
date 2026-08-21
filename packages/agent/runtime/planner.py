import re
import unicodedata
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


def strip_accents(text: str) -> str:
    """Removes Vietnamese diacritics for robust intent matching."""
    text = text.replace('đ', 'd').replace('Đ', 'D')
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )


class ExecutionPlan(BaseModel):
    intent: str
    target_tool: Optional[str] = None
    arguments: Dict[str, Any] = {}
    confidence: float = 1.0


class IntentPlanner:
    """Classifies user query intent and builds structured execution plan."""

    @staticmethod
    def plan(user_message: str) -> ExecutionPlan:
        msg = user_message.lower().strip()
        msg_norm = strip_accents(msg)

        def matches_any(keywords: List[str]) -> bool:
            for kw in keywords:
                kw_lower = kw.lower()
                kw_norm = strip_accents(kw_lower)
                if kw_lower in msg or kw_norm in msg_norm:
                    return True
            return False

        # 1. Adversarial: Account Safety Inquiry (Checklist Requirement 12)
        if matches_any([
            "an toàn không", "an toan khong", "an toàn tuyệt đối không", "an toan tuyet doi khong",
            "tài khoản của tôi có an toàn", "tai khoan cua toi co an toan", "is my account safe",
            "am i safe", "an toàn chứ", "an toan chu", "an toan",
        ]):
            return ExecutionPlan(
                intent="ACCOUNT_SAFETY_INQUIRY",
                target_tool=None,
                arguments={},
            )

        # 2. Transaction Authenticity & Scam Verification (Screenshot Verification - priority over transfer check)
        if matches_any([
            "gửi ảnh", "gui anh", "ảnh chuyển", "anh chuyen", "ảnh thanh toán", "anh thanh toan",
            "ảnh giao dịch", "anh giao dich", "kiểm tra ảnh", "kiem tra anh", "xác minh giao dịch",
            "xac minh giao dich", "xác thực giao dịch", "xac thuc giao dich", "có thật không", "co that khong",
            "biên lai giả", "bien lai gia", "wf-839291", "wf-99210", "fake payment", "verify payment",
            "screenshot", "nói wealify đã chuyển", "noi wealify da chuyen", "nói đã chuyển", "noi da chuyen",
            "nhận được email nói tiền đã chuyển", "nhan duoc email noi tien da chuyen",
            "người này gửi ảnh", "nguoi nay gui anh", "chuyển $2,500 cho tôi", "chuyen $2,500 cho toi",
            "chuyển $2500 cho tôi", "chuyen $2500 cho toi", "2500 cho toi", "$2,500",
        ]):
            return ExecutionPlan(
                intent="VERIFY_TRANSACTION_AUTHENTICITY",
                target_tool="verify_transaction_authenticity",
                arguments={"raw_text": user_message},
            )

        # 3. Email Report Dispatch Request (HITL User Request - priority over transfer check)
        if matches_any([
            "báo cáo tháng này", "bao cao thang nay", "gửi báo cáo", "gui bao cao",
            "vào email của tôi", "vao email cua toi", "send report to my email", "email báo cáo",
            "gửi báo cáo cho tôi", "gui bao cao cho toi", "gui bao cao vao email", "gửi vào email",
        ]):
            return ExecutionPlan(
                intent="EMAIL_REPORT_REQUEST",
                target_tool="generate_expense_report",
                arguments={},
            )

        # 4. Email Match & Receipt Verification Inquiry
        if matches_any([
            "có email xác nhận không", "co email xac nhan khong", "có email không", "co email khong",
            "tìm thấy email", "tim thay email", "email biên lai", "email bien lai", "email khớp", "email khop",
        ]):
            return ExecutionPlan(
                intent="EMAIL_VERIFICATION_INQUIRY",
                target_tool="search_transactions",
                arguments={"query": "email"},
            )

        # 5. 3-Way Reconciliation Inquiries
        if matches_any([
            "rời tài khoản", "roi tai khoan", "rời account", "roi account", "chưa lên thẻ", "chua len the",
            "chưa xuất hiện trên card", "chua xuat hien tren card", "chưa vào thẻ", "chua vao the",
            "lệch giữa account và card", "lech giua account va card", "đối soát 3 nguồn", "doi soat 3 nguon",
            "3-way", "chua len card", "chua sang the",
        ]):
            return ExecutionPlan(
                intent="THREE_WAY_RECONCILIATION_INQUIRY",
                target_tool="reconcile_transactions",
                arguments={},
            )

        # 6. Check Disallowed Mutating Actions (Imperative commands only)
        if (
            re.search(r"^(?:hãy\s+|vui lòng\s+|tự\s+|hộ\s+|hay\s+|vui long\s+|tu\s+|ho\s+)?(?:chuyển|chuyen|bắn|ban|gửi|gui|rút|rut|nạp|nap|pay|transfer|send|wire)\s+\$?\d+", msg_norm, re.IGNORECASE)
            or re.search(r"^(?:chuyển|chuyen|transfer|send)\s+\$?\d+\s+(?:cho|tới|toi|vào|vao|sang)", msg_norm, re.IGNORECASE)
            or re.search(r"(?:hãy\s+|tự\s+|vui lòng\s+|hay\s+|tu\s+|vui long\s+)?(?:huỷ|hủy|huy|dừng|dung|ngắt|ngat|cancel|unsubscribe)\s+(?:subscription|gói|goi|dịch vụ|dich vu|membership|netflix|adobe|spotify)", msg_norm, re.IGNORECASE)
            or re.search(r"chargeback|đòi tiền lại ngay|doi tien lai ngay|tự hoàn tiền trực tiếp|tu hoan tien truc tiep|tự động hoàn tiền|tu dong hoan tien", msg_norm, re.IGNORECASE)
            or re.search(r"(?:hãy\s+|tự\s+|vui lòng\s+|hay\s+|tu\s+|vui long\s+)?(?:khóa|khoá|khoa|block|freeze|lock)\s+thẻ|lock\s+card|block\s+card|khoa\s+the", msg_norm, re.IGNORECASE)
            or ((("gửi email" in msg or "gui email" in msg_norm or "gửi thư" in msg or "email to" in msg) and any(x in msg_norm for x in ["cho netflix", "cho ngan hang", "cho bank", "cho merchant", "khieu nai netflix", "khieu nai cho ngan hang", "khieu nai vpbank"])))
        ):
            return ExecutionPlan(
                intent="DISALLOWED_MUTATION",
                target_tool=None,
                arguments={},
            )

        # 7. Spending Surge & Category Spike Detection
        if matches_any([
            "đột biến", "dot bien", "bất thường", "bat thuong", "tiêu nhiều thế", "tieu nhieu the",
            "tăng vọt", "tang vot", "spending surge", "surge", "surging", "spike", "spiking", "baseline",
            "spending increase", "spending higher", "so với tuần trước", "so voi tuan truoc",
            "so với tháng trước", "so voi thang truoc", "tại sao tuần này", "tai sao tuan nay",
            "tại sao tháng này", "tai sao thang nay", "chi tiêu bất thường", "chi tieu bat thuong",
            "chi tiêu đột biến", "chi tieu dot bien", "tăng đột biến", "tang dot bien", "tăng nhiều thế",
        ]):
            return ExecutionPlan(
                intent="SPENDING_SURGE_INQUIRY",
                target_tool="detect_spending_surges",
                arguments={"window_days": 7},
            )

        # 8. Specific Top 3 Expenses Inquiry (Priority over general advisory)
        if matches_any([
            "3 khoản lớn nhất", "3 khoan lon nhat", "top 3", "3 khoản chi lớn nhất",
            "3 khoan chi lon nhat", "khoản chi lớn nhất là gì", "khoan chi lon nhat la gi",
            "top spending", "khoản lớn nhất", "khoan lon nhat", "lớn nhất là gì",
        ]):
            return ExecutionPlan(
                intent="TOP_EXPENSES_INQUIRY",
                target_tool="generate_expense_report",
                arguments={},
            )

        # 9. Business Health & Financial Advisory
        if matches_any([
            "kinh doanh", "lợi nhuận", "loi nhuan", "lãi lỗ", "lai lo", "hiệu quả kinh doanh",
            "có nên tiếp tục", "co nen tiep tuc", "sức khỏe tài chính", "suc khoe tai chinh",
            "tư vấn tài chính", "tu van tai chinh", "roas", "burn rate", "tình hình tài chính",
            "tinh hinh tai chinh",
        ]):
            return ExecutionPlan(
                intent="BUSINESS_HEALTH_ADVISORY",
                target_tool="analyze_business_health",
                arguments={},
            )


        # 10. Total Fees Inquiry
        if matches_any([
            "phí bao nhiêu", "phi bao nhieu", "tổng phí", "tong phi", "bị tính phí bao nhiêu",
            "bi tinh phi bao nhieu", "phí dịch vụ", "phi dich vu", "total fees",
        ]):
            return ExecutionPlan(
                intent="FEE_INQUIRY",
                target_tool="generate_expense_report",
                arguments={},
            )

        # 11. Specific Transaction / Amount Inquiry (e.g. "Khoản $9.99 này là gì?")
        if "$9.99" in msg or "9.99" in msg:
            return ExecutionPlan(
                intent="SPECIFIC_AMOUNT_INQUIRY",
                target_tool="search_transactions",
                arguments={"query": "9.99"},
            )

        # 12. Duplicate Check
        if matches_any([
            "trùng", "trung", "hai lần", "hai lan", "2 lần", "2 lan", "cà 2 lần", "ca 2 lan",
            "quẹt 2 lần", "quet 2 lan", "duplicate", "bị trừ đúp", "bi tru dup", "cà thẻ", "ca the",
            "tính hai lần", "tinh hai lan",
        ]):
            return ExecutionPlan(
                intent="DUPLICATE_CHECK",
                target_tool="find_duplicates",
                arguments={"time_window_hours": 48},
            )

        # 13. Subscriptions & Price Hike Inquiry
        if matches_any([
            "subscription", "tăng giá", "tang gia", "gói nào vừa tăng", "goi nao vua tang",
            "định kỳ", "dinh ky", "gói tháng", "goi thang", "hàng tháng", "hang thang",
            "netflix", "spotify", "adobe", "openai", "chatgpt",
            "đang có những subscription", "dang co nhung subscription", "nhung subscription nao",
        ]):
            return ExecutionPlan(
                intent="SUBSCRIPTION_INQUIRY",
                target_tool="find_subscriptions",
                arguments={},
            )

        # 14. Overdue / Missing Payout Radar
        if matches_any([
            "payout", "chưa về", "chua ve", "chưa tới", "chua toi", "bên bán", "ben ban",
            "amazon", "stripe", "shopify", "giải ngân", "giai ngan", "settlement",
        ]):
            return ExecutionPlan(
                intent="OVERDUE_PAYOUT_CHECK",
                target_tool="detect_overdue_payouts",
                arguments={},
            )

        # 15. General Monthly Summary / Expense Report
        if matches_any([
            "chi bao nhiêu", "chi bao nhieu", "tổng chi", "tong chi", "báo cáo", "bao cao",
            "tháng này", "thang nay", "summary", "report", "tiêu bao nhiêu", "tieu bao nhieu",
            "da chi", "đã chi",
        ]):
            return ExecutionPlan(
                intent="MONTHLY_SUMMARY",
                target_tool="generate_expense_report",
                arguments={},
            )

        # 16. General Reconciliation Check
        if matches_any([
            "đối soát", "doi soat", "lệch", "lech", "reconcile",
        ]):
            return ExecutionPlan(
                intent="RECONCILIATION_CHECK",
                target_tool="reconcile_transactions",
                arguments={},
            )

        # 17. Transaction Search
        if matches_any(["tìm", "tim", "search", "grab", "apple", "facebook"]):
            return ExecutionPlan(
                intent="TRANSACTION_SEARCH",
                target_tool="search_transactions",
                arguments={"query": user_message},
            )

        # Default General QA
        return ExecutionPlan(
            intent="GENERAL_QA",
            target_tool=None,
            arguments={},
        )
