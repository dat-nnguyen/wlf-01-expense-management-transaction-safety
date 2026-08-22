"""Google Agent Development Kit (ADK) Specialized Sub-Agents for Wealify Guardian.

Implements domain-specialized LlmAgents conforming to Google ADK 2.4.0 multi-agent
specifications. Each sub-agent is scoped to its domain tools and safety rules.
"""

try:
    from google.adk import Agent
except ImportError:
    class Agent:
        def __init__(self, *args, **kwargs):
            self.name = kwargs.get("name", "agent")
            self.sub_agents = kwargs.get("sub_agents", [])
            self.tools = kwargs.get("tools", [])
from packages.agent.adk.config import get_adk_model_name
from packages.agent.adk.callbacks import (
    guardian_before_tool_callback,
    guardian_after_tool_callback,
    guardian_on_tool_error_callback,
)
from packages.agent.adk.tools import (
    verify_transaction_authenticity,
    find_duplicate_charges,
    detect_overdue_payouts,
    find_active_subscriptions,
    reconcile_3way_transactions,
    generate_expense_report,
    search_financial_transactions,
    get_transaction_details,
    search_email_inbox,
    analyze_business_health,
    detect_spending_surges,
)

_model = get_adk_model_name()

# 1. Authenticity & Anti-Scam Verification Sub-Agent
AUTHENTICITY_INSTRUCTION = """
Bạn là Authenticity & Scam Verification Specialist của Wealify Guardian.
Nhiệm vụ:
- Xác thực ảnh chụp màn hình chuyển khoản, biên lai, mã giao dịch (VD: WF-839291, WF-99210) với sổ cái Wealify.
- Tính toán điểm mâu thuẫn bằng chứng (Conflict Score).
- Phát hiện email giả mạo (phishing) và hóa đơn không khớp.
- Gắn đúng 1 trong 3 nhãn chuẩn: 'Định kỳ đã xác định', 'Cần bạn tự xác nhận', 'Chưa đủ dữ liệu'.
- Tuyệt đối không tự ý thực hiện hoàn tiền hoặc liên hệ đối tượng lừa đảo.
"""

authenticity_agent = Agent(
    name="authenticity_guardian",
    model=_model,
    description="Specialized in fraud detection, fake payment screenshot verification, and evidence conflict analysis.",
    instruction=AUTHENTICITY_INSTRUCTION,
    tools=[
        verify_transaction_authenticity,
        search_financial_transactions,
        search_email_inbox,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

# 2. 3-Way Reconciliation & Overdue Payouts Sub-Agent
RECONCILIATION_INSTRUCTION = """
Bạn là 3-Way Reconciliation & Payouts Specialist của Wealify Guardian.
Nhiệm vụ:
- Thực hiện đối soát 3 nguồn (Bank Account <-> Wallet <-> Card).
- Bắt buộc diễn giải sai lệch đúng định dạng: 'Lệch $X giữa [Nguồn A] và [Nguồn B] — chưa xác định nguyên nhân.'
- Quét các khoản thanh toán chậm từ các sàn (Amazon, Stripe, Shopify, Payoneer) khi đã có email báo nhưng tiền chưa vào tài khoản.
- Nhắc nhở mốc 60 ngày khiếu nại theo Regulation E.
"""

reconciliation_agent = Agent(
    name="reconciliation_guardian",
    model=_model,
    description="Specialized in 3-Way balance reconciliation and overdue e-commerce platform payouts.",
    instruction=RECONCILIATION_INSTRUCTION,
    tools=[
        reconcile_3way_transactions,
        detect_overdue_payouts,
        search_financial_transactions,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

# 3. Anomaly & Duplicate Charges Sub-Agent
ANOMALY_INSTRUCTION = """
Bạn là Anomaly & Duplicate Detection Specialist của Wealify Guardian.
Nhiệm vụ:
- Phát hiện các khoản bị trừ tiền 2 lần (Grab, Meta Ads, TikTok Ads, Volcano, Google Ads) trong khoảng thời gian ngắn hoặc cùng số tiền.
- Phát hiện đột biến chi tiêu (Spending Surges) theo tuần/tháng và phân tích nguyên nhân gốc rễ (Root Cause Drivers).
- Nhắc nhở mốc 60 ngày khiếu nại và cung cấp mẫu đơn khiếu nại (Dispute Draft).
"""

anomaly_agent = Agent(
    name="anomaly_guardian",
    model=_model,
    description="Specialized in duplicate transaction detection and abnormal spending surge analysis.",
    instruction=ANOMALY_INSTRUCTION,
    tools=[
        find_duplicate_charges,
        detect_spending_surges,
        search_financial_transactions,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

# 4. SaaS Subscription & Price Hike Sub-Agent
SUBSCRIPTION_INSTRUCTION = """
Bạn là SaaS Subscription & Recurring Billing Specialist của Wealify Guardian.
Nhiệm vụ:
- Rà soát các dịch vụ định kỳ (Netflix, AWS, OpenAI, ChatGPT, GitHub, Slack, Adobe).
- Phát hiện tăng giá âm thầm (Silent Price Hikes) và cảnh báo tới người dùng.
- Dự phóng chi phí hàng năm và ngày gia hạn tiếp theo.
- Tuân thủ nguyên tắc Read-Only: Hướng dẫn người dùng tự hủy trên cổng nhà cung cấp, không tự ý hủy gói.
"""

subscription_agent = Agent(
    name="subscription_guardian",
    model=_model,
    description="Specialized in SaaS subscriptions discovery, recurring billing monitoring, and silent price hikes.",
    instruction=SUBSCRIPTION_INSTRUCTION,
    tools=[
        find_active_subscriptions,
        search_financial_transactions,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

# 5. Financial Advisory & Expense Reporting Sub-Agent
ADVISORY_INSTRUCTION = """
Bạn là Financial Advisory & Reporting Specialist của Wealify Guardian.
Nhiệm vụ:
- Tổng hợp báo cáo chi tiêu hàng tháng, quý, năm, thống kê phí và top 3 khoản chi lớn nhất.
- Đánh giá sức khỏe tài chính doanh nghiệp: Cash Burn, ROAS, Net Profit, Unit Economics.
- Đưa ra khuyến nghị tối ưu dòng tiền mang tính tham khảo.
- Đính kèm dòng lưu ý pháp lý bắt buộc cuối báo cáo.
"""

advisory_agent = Agent(
    name="advisory_guardian",
    model=_model,
    description="Specialized in structured expense reports and SME business health advisory.",
    instruction=ADVISORY_INSTRUCTION,
    tools=[
        generate_expense_report,
        analyze_business_health,
        search_financial_transactions,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

# 6. Search & Inbox Evidence Sub-Agent
SEARCH_INSTRUCTION = """
Bạn là Search & Evidence Retrieval Specialist của Wealify Guardian.
Nhiệm vụ:
- Tra cứu nhanh giao dịch theo số tiền ($9.99, $2,500), tên cửa hàng hoặc từ khóa.
- Tìm kiếm biên lai, hóa đơn, email xác nhận trong hòm thư đã xác thực.
- Che thông tin bảo mật (chỉ hiện 4 số cuối thẻ).
"""

search_agent = Agent(
    name="search_guardian",
    model=_model,
    description="Specialized in transaction search, detail inspection, and verified mailbox evidence queries.",
    instruction=SEARCH_INSTRUCTION,
    tools=[
        search_financial_transactions,
        get_transaction_details,
        search_email_inbox,
    ],
    before_tool_callback=guardian_before_tool_callback,
    after_tool_callback=guardian_after_tool_callback,
    on_tool_error_callback=guardian_on_tool_error_callback,
)

__all__ = [
    "authenticity_agent",
    "reconciliation_agent",
    "anomaly_agent",
    "subscription_agent",
    "advisory_agent",
    "search_agent",
]
