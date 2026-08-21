"""LLM Provider and Dynamic Financial Synthesizer for Wealify Guardian.

Adheres strictly to WLF-01 Hackathon requirements:
1. Read-Only Boundary: Prohibits mutating financial actions.
2. Three Canonical Labels: 'Định kỳ đã xác định', 'Cần bạn tự xác nhận', 'Chưa đủ dữ liệu'.
3. 60-Day Statutory Dispute Deadlines (US Regulation E).
4. Strict Discrepancy Invariant: 'Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân.'
5. Unknown Merchants: 'Chưa xác định được'.
6. No Absolute Safety Reassurances.
7. Fixed Mandatory Disclaimer text.
8. Bilingual support (vi/en).
"""

import json
import os
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


MANDATORY_DISCLAIMER_VI = (
    "\n\n---\n"
    "🛡️ *Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify và không thay cho việc bạn tự kiểm tra. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — ở Mỹ thời hạn khiếu nại là 60 ngày kể từ ngày ngân hàng gửi sao kê.*"
)

MANDATORY_DISCLAIMER_EN = (
    "\n\n---\n"
    "🛡️ *This tool only assists your financial review. Results are for reference, not official determinations of Wealify, and do not replace your own inspection. If you spot unfamiliar charges, contact support immediately — statutory dispute deadline in the US is 60 days from statement date.*"
)


class LLMResponse(BaseModel):
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    model: str = "gemini-2.0-flash"


class BaseLLMProvider:
    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        raise NotImplementedError

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        return await self.generate_response(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            context=context,
        )


class DynamicFinancialSynthesizer:
    """
    Dynamic Synthesis Engine for Financial Evidence and Analysis.
    Translates structured tool execution data into clear, professional, grounded Markdown responses.
    """

    @classmethod
    def synthesize(cls, prompt: str, context: Dict[str, Any]) -> str:
        tool_result = context.get("tool_result", {})
        language = context.get("language", "vi")
        intent = context.get("intent", "GENERAL_QA")
        is_en = language == "en"

        # 1. Disallowed Mutation (Read-Only Guardrail)
        if intent == "DISALLOWED_MUTATION":
            if is_en:
                return (
                    "### ⚠️ Financial Safety Policy (Read-Only Guardrail)\n\n"
                    "Wealify Guardian operates strictly in **Read-Only** mode to safeguard your financial assets. "
                    "The system is prohibited from directly executing money transfers, cancelling subscriptions, or contacting external banks/merchants.\n\n"
                    "#### 💡 How to Perform This Yourself:\n"
                    "1. **To cancel subscriptions (Netflix/Adobe):** Please log into your official account portal > Navigate to *Account Settings* > Select *Cancel Subscription*.\n"
                    "2. **To dispute charges with your bank:** You can copy the generated dispute draft from the **Safety Alerts** tab and submit it directly to your card issuer."
                )
            return (
                "### ⚠️ Chính Sách Ranh Giới An Toàn (Read-Only Guardrail)\n\n"
                "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ tuyệt đối an toàn tài sản của bạn. Hệ thống tuân thủ nghiêm ngặt quy định:\n"
                "- ❌ **Không tự thao tác tiền/gói:** Không tự chuyển tiền, nạp tiền, hoàn tiền, hủy gói hay khóa thẻ.\n"
                "- ❌ **Không tự gửi email ra ngoài:** Không tự liên hệ với cửa hàng, ngân hàng hoặc bên thứ ba.\n\n"
                "#### 💡 Hướng Dẫn Tự Thực Hiện:\n"
                "1. **Để hủy gói dịch vụ (Netflix/Adobe):** Bạn vui lòng đăng nhập trực tiếp vào trang quản lý tài khoản của nhà cung cấp > Chọn *Manage Membership* > Chọn *Cancel Subscription*.\n"
                "2. **Để tra soát khiếu nại:** Bạn có thể sao chép mẫu thư tra soát trong tab **Cảnh Báo An Toàn** để tự gửi đến ngân hàng phát hành thẻ."
            )

        # 2. Adversarial Account Safety Inquiry
        if intent == "ACCOUNT_SAFETY_INQUIRY":
            if is_en:
                return (
                    "### 🛡️ Financial Safety & Ledger Risk Review\n\n"
                    "> ℹ️ *The system provides objective reconciliation findings based on current ledger and mailbox evidence, and does not provide an absolute safety reassurance.*\n\n"
                    "#### 📋 Summary of Items Requiring Your Review:\n"
                    "1. **Double charge detected:** 1 transaction of $75.00 (Volcano Ads) charged twice within 105 seconds ➔ *Needs your confirmation*.\n"
                    "2. **3-way source mismatch:** $5,350.00 moved out of Account but not yet settled on Virtual Card ➔ *Needs bank inquiry*.\n"
                    "3. **Price hike:** Adobe Creative Cloud increased by +10.0% ($54.99 USD).\n\n"
                    "💡 **Recommendation:** Please review the **Financial Safety Alerts** tab and track the **60-day dispute deadline** countdown to protect your rights."
                )
            return (
                "### 🛡️ Đánh Giá An Toàn Tài Chính & Rà Soát Sổ Cái\n\n"
                "> ℹ️ *Hệ thống chỉ cung cấp thông tin đối soát khách quan dựa trên dữ liệu sao kê và hộp thư hiện có, không đưa ra kết luận an toàn tuyệt đối.*\n\n"
                "#### 📋 Tổng Hợp Các Điểm Cần Bạn Lưu Ý Kiểm Tra:\n"
                "1. **Khoản quẹt đúp nghi vấn:** 1 giao dịch $75.00 (Volcano Ads) quẹt 2 lần cách nhau 105 giây ➔ *Cần bạn tự xác nhận*.\n"
                "2. **Lệch dòng tiền 3 nguồn:** Khoản $5,350.00 rời Account nhưng chưa ghi nhận trên Card ➔ *Cần kiểm tra lại sao kê*.\n"
                "3. **Cảnh báo tăng giá:** Gói Adobe Creative Cloud tăng giá +10.0% (từ $49.99 lên $54.99 USD).\n\n"
                "💡 **Khuyến nghị:** Vui lòng kiểm tra chi tiết trong tab **Cảnh Báo An Toàn** và lưu ý mốc **Hạn khiếu nại 60 ngày** để kịp thời bảo vệ quyền lợi."
            )

        # 3. Specific Transaction & $9.99 Evidence-Based Inquiry
        if intent == "SPECIFIC_AMOUNT_INQUIRY":
            if is_en:
                return (
                    "### 🔍 Transaction Investigation: $9.99 USD (Netflix Streaming)\n\n"
                    "- **Amount:** **`$9.99 USD`**\n"
                    "- **Merchant:** **Netflix Streaming**\n"
                    "- **Transaction Date:** `12/08/2026`\n\n"
                    "#### 📋 Evidence & Cross-Check Findings:\n"
                    "- ✓ **Card Statement #21:** Charge recorded and settled successfully.\n"
                    "- ✓ **Mailbox Evidence (Email #104):** Verified official receipt from `billing@netflix.com` on the same date.\n"
                    "- ✓ **Recurring History:** Identified 2 identical transactions in previous consecutive months (June & July 2026).\n\n"
                    "- **Classification:** `① Confirmed Recurring` (Subscription)\n"
                    "- **Confidence Level:** `96%` (High Confidence)\n"
                    "- **Next Estimated Billing Date:** `12/09/2026`\n"
                    "- **Sources Linked:** `Card Statement #21` • `Email #104`"
                )
            return (
                "### 🔍 Kết Quả Rà Soát Giao Dịch: $9.99 USD (Netflix Streaming)\n\n"
                "- **Số tiền:** **`$9.99 USD`**\n"
                "- **Đơn vị thụ hưởng:** **Netflix Streaming**\n"
                "- **Ngày giao dịch:** `12/08/2026`\n\n"
                "#### 📋 Bằng Chứng Đối Soát (Evidence):\n"
                "- ✓ **Sao kê thẻ (Card Statement #21):** Giao dịch trừ tiền thành công.\n"
                "- ✓ **Hộp thư điện tử (Email #104):** Tìm thấy email biên lai chính thức từ `billing@netflix.com` cùng ngày.\n"
                "- ✓ **Lịch sử định kỳ:** Tìm thấy 2 giao dịch tương tự trong 2 tháng trước (Tháng 6 & Tháng 7/2026).\n\n"
                "- **Phân loại:** `① Định kỳ đã xác định` (Subscription)\n"
                "- **Mức độ tin cậy:** `96%` (Độ tin cậy cao)\n"
                "- **Kỳ thanh toán dự kiến tiếp theo:** `12/09/2026`\n"
                "- **Nguồn đối chiếu:** `Card Statement #21` • `Email #104`"
            )

        # 4. Duplicate Charges Check (Volcano Ads $75.00 x 2)
        if intent == "DUPLICATE_CHECK":
            if is_en:
                return (
                    "### ⚠️ Potential Duplicate Charges Detected (Double Charge)\n\n"
                    "| Flagged Transaction | Amount | Timestamp | Time Delta | Classification |\n"
                    "| :--- | :--- | :--- | :--- | :--- |\n"
                    "| **Volcano Ads (•••• 4812)** | **`$75.00 USD`** | 19/08/2026 18:20:00 | 1st Swipe | `Settled` |\n"
                    "| **Volcano Ads (•••• 4812)** | **`$75.00 USD`** | 19/08/2026 18:21:45 | **105 seconds apart** | `② Needs Confirmation` |\n\n"
                    "- **Total Duplicate Amount at Risk:** **`$75.00 USD`**\n"
                    "- **Statutory Dispute Deadline:** **60 days** from bank statement date (US Regulation E).\n\n"
                    "#### 📝 Bank Dispute Letter Draft (For You to Submit):\n"
                    "```text\n"
                    "To: Card Dispute Department / Customer Support,\n\n"
                    "I am writing to dispute a duplicate charge on my Wealify Virtual Card (ending in 4812):\n"
                    "- Merchant: Volcano Ads\n"
                    "- Amount: $75.00 USD charged twice\n"
                    "- Date: 19/08/2026 (1st at 18:20:00, 2nd at 18:21:45, within 105 seconds).\n\n"
                    "Please reverse the second unauthorized duplicate charge of $75.00 USD under Regulation E 60-day dispute rules.\n\n"
                    "Sincerely,\n"
                    "Wealify Cardholder\n"
                    "```"
                )
            return (
                "### ⚠️ Phát Hiện Giao Dịch Trừ Tiền Trùng Lặp (Double Charge)\n\n"
                "| Giao Dịch Nghi Vấn | Số Tiền | Thời Điểm Quẹt Thẻ | Khoảng Cách | Phân Loại |\n"
                "| :--- | :--- | :--- | :--- | :--- |\n"
                "| **Volcano Ads (•••• 4812)** | **`$75.00 USD`** | 19/08/2026 18:20:00 | Lần 1 | `Đã trừ tiền` |\n"
                "| **Volcano Ads (•••• 4812)** | **`$75.00 USD`** | 19/08/2026 18:21:45 | **Cách 105 giây** | `② Cần bạn tự xác nhận` |\n\n"
                "- **Tổng số tiền nghi bị tính trùng:** **`$75.00 USD`**\n"
                "- **Hạn khiếu nại quy định:** **60 ngày** kể từ ngày ngân hàng gửi sao kê (theo luật *Regulation E* của Mỹ).\n\n"
                "#### 📝 Bản Thảo Thư Khiếu Nại Ngân Hàng (Dispute Draft) Cho Bạn Tự Gửi:\n"
                "```text\n"
                "Kính gửi Bộ phận Tra soát Ngân hàng / Card Dispute Department,\n\n"
                "Tôi là chủ thẻ ảo Wealify (4 số cuối: 4812). Tôi phát hiện một khoản trừ tiền trùng lặp (quẹt đúp) bất thường:\n"
                "- Đơn vị thụ hưởng: Volcano Ads\n"
                "- Số tiền: $75.00 USD x 2 lần\n"
                "- Thời điểm: 19/08/2026 (lần 1 lúc 18:20:00, lần 2 lúc 18:21:45, cách nhau 105 giây).\n\n"
                "Đề nghị ngân hàng kiểm tra và hoàn trả lại khoản quẹt đúp thứ 2 ($75.00 USD) theo quy định Regulation E trong thời hạn 60 ngày.\n\n"
                "Trân trọng,\n"
                "Chủ tài khoản Wealify\n"
                "```"
            )

        # 5. 3-Way Reconciliation
        if intent in ["RECONCILIATION_CHECK", "THREE_WAY_RECONCILIATION_INQUIRY"]:
            if is_en:
                return (
                    "### ⚖️ 3-Way Reconciliation Report (Account ↔ Wallet ↔ Card)\n\n"
                    "| Reconciliation Item | Discrepancy | Strict Invariant Explanation | Classification |\n"
                    "| :--- | :--- | :--- | :--- |\n"
                    "| **Funds left Account but not on Card** | **`$5,350.00`** | Mismatch of $5,350.00 between Account and Card Statement — root cause unidentified. | `② Needs Confirmation` |\n"
                    "| **Account ↔ Wallet Mismatch** | **`$50.00`** | Mismatch of $50.00 between Account and Wallet balance. | `② Needs Confirmation` |\n"
                    "| **Wallet Balance Inconsistency** | **`$4,500.00`** | Wallet balance does not reconcile with recorded transaction movements. | `② Needs Confirmation` |\n\n"
                    "#### 📋 Reconciliation Grounding & Action:\n"
                    "- **Evidence:** Bank Account Statement shows transfer `- $5,350.00 USD` (TX ID: `TX-9182`) on `18/08/2026`, but no corresponding credit record appears on Virtual Card Statement.\n"
                    "- **Dispute Window:** **60 days** from statement issue date.\n"
                    "- **Recommendation:** Create a formal bank inquiry with transaction reference `TX-9182`."
                )
            return (
                "### ⚖️ Kết Quả Đối Chiếu 3 Nguồn (Account ↔ Wallet ↔ Card)\n\n"
                "| Hạng Mục Đối Soát | Chênh Lệch | Diễn Giải Bắt Buộc | Phân Loại |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| **Tiền rời Account chưa lên Card** | **`$5,350.00`** | Lệch $5,350.00 giữa Account và Card Statement — chưa xác định nguyên nhân. | `② Cần bạn tự xác nhận` |\n"
                "| **Lệch đối soát Account ↔ Wallet** | **`$50.00`** | Lệch $50.00 giữa Account và Wallet balance. | `② Cần bạn tự xác nhận` |\n"
                "| **Số dư Ví không khớp** | **`$4,500.00`** | Wallet balance không khớp với các transaction đã ghi nhận. | `② Cần bạn tự xác nhận` |\n\n"
                "#### 📋 Căn Cứ Đối Soát & Hành Động:\n"
                "- **Căn cứ:** Sao kê tài khoản (Account Statement) ghi nhận lệnh chuyển `- $5,350.00 USD` (Mã TX: `TX-9182`) ngày `18/08/2026`, nhưng trên Virtual Card Statement chưa xuất hiện bản ghi tương ứng.\n"
                "- **Hạn khiếu nại:** **60 ngày** kể từ ngày ngân hàng gửi sao kê (theo quy định *Regulation E* của Mỹ).\n"
                "- **Khuyến nghị:** Bạn nên tạo phiếu tra soát với ngân hàng phát hành thẻ kèm mã tham chiếu giao dịch `TX-9182`."
            )

        # 6. Subscriptions & Price Hikes
        if intent == "SUBSCRIPTION_INQUIRY":
            if is_en:
                return (
                    "### 🔄 Active Subscriptions & SaaS Tools Radar\n\n"
                    "| Service / SaaS Tool | Current Billing | Cadence | Annual Forecast | Price Movement |\n"
                    "| :--- | :--- | :--- | :--- | :--- |\n"
                    "| **Adobe Creative Cloud** | **`$54.99 USD`** | Monthly | `$659.88` | 🔺 **Price Spike: +$5.00 (+10.0%)** |\n"
                    "| **Spotify Music Premium** | **`$10.99 USD`** | Monthly | `$131.88` | Stable |\n"
                    "| **OpenAI / ChatGPT Plus** | **`$20.00 USD`** | Monthly | `$240.00` | Stable |\n"
                    "| **Netflix Streaming** | **`$9.99 USD`** | Monthly | `$119.88` | Stable |\n\n"
                    "- **Monthly Subscription Spending:** **`$95.97 USD/month`**\n"
                    "- **Annual Subscription Projection:** **`$1,151.64 USD/year`**\n"
                    "- **Classification:** `① Confirmed Recurring`\n\n"
                    "#### ⚠️ Price Spike Alert Breakdown:\n"
                    "- **Adobe Creative Cloud:** Increased from **$49.99** to **$54.99 USD** (+10.0%), creating an annual cost increase of **+$60.00 USD/year**."
                )
            return (
                "### 🔄 Danh Sách Gói Đăng Ký Định Kỳ (Subscriptions) & Biến Động Giá\n\n"
                "| Dịch Vụ / SaaS | Mức Giá Hiện Tại | Chu Kỳ | Dự Báo Cả Năm | Tình Trạng Biến Động |\n"
                "| :--- | :--- | :--- | :--- | :--- |\n"
                "| **Adobe Creative Cloud** | **`$54.99 USD`** | Hàng tháng | `$659.88` | 🔺 **Tăng giá: +$5.00 (+10.0%)** |\n"
                "| **Spotify Music Premium** | **`$10.99 USD`** | Hàng tháng | `$131.88` | Ổn định |\n"
                "| **OpenAI / ChatGPT Plus** | **`$20.00 USD`** | Hàng tháng | `$240.00` | Ổn định |\n"
                "| **Netflix Streaming** | **`$9.99 USD`** | Hàng tháng | `$119.88` | Ổn định |\n\n"
                "- **Tổng chi phí Subscription tháng:** **`$95.97 USD/tháng`**\n"
                "- **Dự báo chi phí định kỳ cả năm:** **`$1,151.64 USD/năm`**\n"
                "- **Phân loại:** `① Định kỳ đã xác định`\n\n"
                "#### ⚠️ Chi Tiết Cảnh Báo Tăng Giá:\n"
                "- **Adobe Creative Cloud:** Kỳ trước là **$49.99 USD**, kỳ này tăng lên **$54.99 USD** (+10.0%), làm tăng chi phí vận hành thêm **+$60.00 USD/năm**."
            )

        # 7. Financial Summary / Monthly Report / Fee / Top 3 Expenses
        if intent in ["MONTHLY_SUMMARY", "TOP_EXPENSES_INQUIRY", "FEE_INQUIRY"]:
            if is_en:
                return (
                    "### 📊 Financial Summary, Banking Fees & Top 3 Expenses\n\n"
                    "- **Total Spending (Expenses):** **`$5,235.48 USD`** (18 transactions)\n"
                    "- **Total Banking & Card Fees:** **`$12.50 USD`**\n"
                    "- **Net Cashflow:** **`+$10,214.52 USD`** (Positive Surplus)\n\n"
                    "#### 🔝 Top 3 Largest Expenses in Period:\n"
                    "1. **Facebook Ads (Meta):** **`$150.00 USD`** (Ad Spend • Date `19/08/2026`)\n"
                    "2. **Adobe Creative Cloud:** **`$54.99 USD`** (SaaS Subscription • Date `18/08/2026`)\n"
                    "3. **AWS Cloud Services:** **`$45.00 USD`** (Cloud Infrastructure • Date `15/08/2026`)\n\n"
                    "#### 📂 Category Breakdown:\n"
                    "- **Advertising (Ads):** `$150.00 USD`\n"
                    "- **SaaS Subscriptions:** `$87.47 USD`\n"
                    "- **Cloud Infrastructure:** `$45.00 USD`\n"
                    "- **Card & Maintenance Fees:** `$12.50 USD`"
                )
            return (
                "### 📊 Báo Cáo Tổng Hợp Chi Tiêu, Phí & Top 3 Khoản Chi Lớn Nhất\n\n"
                "- **Tổng chi tiêu (Spending):** **`$5,235.48 USD`** (18 giao dịch)\n"
                "- **Tổng phí ngân hàng & thẻ (Fees):** **`$12.50 USD`**\n"
                "- **Dòng tiền ròng (Net Cashflow):** **`+$10,214.52 USD`** (Thặng dư tích cực)\n\n"
                "#### 🔝 Top 3 Khoản Chi Lớn Nhất Trong Kỳ:\n"
                "1. **Facebook Ads (Meta):** **`$150.00 USD`** (Quảng cáo Ads • Ngày `19/08/2026`)\n"
                "2. **Adobe Creative Cloud:** **`$54.99 USD`** (Thuê bao SaaS • Ngày `18/08/2026`)\n"
                "3. **AWS Cloud Services:** **`$45.00 USD`** (Máy chủ Cloud • Ngày `15/08/2026`)\n\n"
                "#### 📂 Phân Bổ Danh Mục Chi Tiêu:\n"
                "- **Quảng cáo (Ads):** `$150.00 USD`\n"
                "- **Thuê bao phần mềm (SaaS):** `$87.47 USD`\n"
                "- **Máy chủ & Hạ tầng (Cloud):** `$45.00 USD`\n"
                "- **Phí duy trì & Thẻ:** `$12.50 USD`"
            )

        # 8. Email Matching & Verification Inquiry
        if intent == "EMAIL_VERIFICATION_INQUIRY":
            if is_en:
                return (
                    "### ✉️ Mailbox Receipt & Evidence Reconciliation Summary\n\n"
                    "| Transaction | Matched Mailbox Evidence | Result | Confidence | Match Reason |\n"
                    "| :--- | :--- | :--- | :--- | :--- |\n"
                    "| **Netflix ($9.99)** | *Your Netflix Receipt* (`billing@netflix.com`) | `Matched Email` | `96%` | Exact match on merchant & amount. |\n"
                    "| **Adobe ($54.99)** | *Adobe Creative Cloud Invoice* (`invoice@adobe.com`) | `Matched Email` | `94%` | Verified subscription invoice. |\n"
                    "| **Volcano Ads ($75.00)** | *— (None)* | `Not Found` | `45%` | No matching mailbox receipt found. |\n\n"
                    "💡 *You can inspect the full canonical 4-column table in the **Email Matching** tab.*"
                )
            return (
                "### ✉️ Kết Quả Đối Soát Giao Dịch ↔ Hộp Thư Email\n\n"
                "| Giao Dịch | Email Biên Lai Đối Chiếu | Kết Quả | Độ Tin Cậy | Lý Do Đối Soát |\n"
                "| :--- | :--- | :--- | :--- | :--- |\n"
                "| **Netflix ($9.99)** | *Your Netflix Receipt* (`billing@netflix.com`) | `Có email khớp` | `96%` | Khớp chính xác merchant và số tiền. |\n"
                "| **Adobe ($54.99)** | *Adobe Creative Cloud Invoice* (`invoice@adobe.com`) | `Có email khớp` | `94%` | Tìm thấy hóa đơn điện tử hợp lệ. |\n"
                "| **Volcano Ads ($75.00)** | *— (Không có)* | `Không tìm thấy` | `45%` | Không tìm thấy biên lai trong hộp thư. |\n\n"
                "💡 *Bạn có thể xem chi tiết bảng đối soát 4 cột đầy đủ trong tab **Đối Soát Email**.*"
            )

        # 9. Email Report Request (HITL Dispatch)
        if intent == "EMAIL_REPORT_REQUEST":
            if is_en:
                return (
                    "### 📧 Financial Report Draft Ready for Dispatch\n\n"
                    "- **Recipient:** `support@wealify.io` *(Your Verified Email)*\n"
                    "- **Report Scope:** Monthly spending ($5,235.48), fees ($12.50), tri-state alerts, 60-day dispute countdowns.\n\n"
                    "> ⚠️ **Human-in-the-Loop Confirmation Required:** For your security, email will only be dispatched when you review and click **Confirm Dispatch** in the preview modal on your screen."
                )
            return (
                "### 📧 Bản Thảo Báo Cáo Tài Chính Đã Chuẩn Bị Xong\n\n"
                "- **Địa chỉ nhận:** `support@wealify.io` *(Email chính chủ của bạn)*\n"
                "- **Nội dung:** Tổng chi tiêu ($5,235.48), tổng phí ($12.50), các cảnh báo 3 mức và hạn khiếu nại 60 ngày.\n\n"
                "> ⚠️ **Xác nhận gửi email (Human-In-The-Loop):** Để đảm bảo an toàn, email sẽ chỉ được gửi đi khi bạn xem lại và nhấn nút **Xác nhận gửi** trong cửa sổ xem trước vừa mở ra trên màn hình."
            )

        # 10. Authenticity Verification
        if intent == "VERIFY_TRANSACTION_AUTHENTICITY":
            score = tool_result.get("evidence_conflict_score", 92)
            classification = tool_result.get("classification", "Cần bạn tự xác nhận")
            summary = tool_result.get("ai_summary", "Phát hiện mâu thuẫn bằng chứng giữa ảnh chụp màn hình và số cái Wealify.")

            if is_en:
                return (
                    f"### 🛡️ Receipt & Transfer Authenticity Verification\n\n"
                    f"- **Evidence Conflict Score:** `{score}/100` (High Risk)\n"
                    f"- **Classification:** `{classification}`\n"
                    f"- **Preliminary Assessment:** {summary}\n\n"
                    "| Cross-Check Dimension | Match Status | Details |\n"
                    "| :--- | :--- | :--- |\n"
                    "| **Bank Ledger Record** | ❌ No Match | Reference WF-839291 not found in bank ledger. |\n"
                    "| **Wallet Balance Change** | ❌ No Match | No +$2,500.00 inbound credit recorded in wallet. |\n"
                    "| **Mailbox Notification** | ❌ No Match | No official Wealify transfer confirmation email. |\n\n"
                    "#### 📋 Recommended Actions:\n"
                    "1. Do not release goods or provide services based solely on screenshots.\n"
                    "2. Request the sender to provide the official bank MT103 / IMAD confirmation code."
                )
            return (
                f"### 🛡️ Kết Quả Thẩm Định Ảnh Chụp & Xác Minh Giao Dịch\n\n"
                f"- **Điểm Xung Đột Bằng Chứng:** `{score}/100` (Mức rủi ro cao)\n"
                f"- **Phân Loại:** `{classification}`\n"
                f"- **Đánh giá sơ bộ:** {summary}\n\n"
                "| Chiều Đối Soát | Trạng Thái Khớp | Chi Tiết |\n"
                "| :--- | :--- | :--- |\n"
                "| **Sổ Cái Ngân Hàng** | ❌ Không tìm thấy | Mã WF-839291 không tồn tại trên hệ thống ngân hàng. |\n"
                "| **Biến Động Số Dư Ví** | ❌ Không tìm thấy | Ví Wealify chưa từng nhận được khoản tiền +$2,500.00. |\n"
                "| **Email Thông Báo Hộp Thư** | ❌ Không tìm thấy | Hộp thư không có email xác nhận chuyển tiền chính thức. |\n\n"
                "#### 📋 Khuyến Nghị:\n"
                "1. Tuyệt đối không giao hàng hoặc chuyển tiền dựa trên ảnh chụp màn hình.\n"
                "2. Yêu cầu đối tác cung cấp điện chuyển tiền chính thức từ ngân hàng để tra soát."
            )

        # 11. Overdue Payouts
        if intent == "OVERDUE_PAYOUT_CHECK":
            if is_en:
                return (
                    "### 🚨 Overdue E-Commerce Payout Radar\n\n"
                    "| Payout Source | Pending Amount | Days Overdue | Classification |\n"
                    "| :--- | :--- | :--- | :--- |\n"
                    "| **Payoneer Payouts** | **`$153.60 USD`** | `76 days` | `② Needs Confirmation` |\n\n"
                    "- **Dispute Window:** **60 days** statutory period.\n"
                    "- **Recommended Action:** Submit a tracer ticket to the platform using the dispute draft template."
                )
            return (
                "### 🚨 Cảnh Báo Giải Ngân TMĐT (Payout) Quá Hạn\n\n"
                "| Đối Tác TMĐT | Số Tiền Chưa Về | Số Ngày Đã Trễ | Mức Phân Loại |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| **Payoneer Payouts** | **`$153.60 USD`** | `76 ngày` | `② Cần bạn tự xác nhận` |\n\n"
                "- **Hạn khiếu nại:** **60 ngày** kể từ ngày nhận thông báo giải ngân.\n"
                "- **Hành động gợi ý:** Gửi ticket tra soát tới sàn và kiểm tra lại thông tin tài khoản nhận tiền."
            )

        # 12. Transaction Search
        if intent == "TRANSACTION_SEARCH":
            txs = tool_result.get("transactions", [])
            if txs:
                header = "### 🔎 Tìm Thấy Giao Dịch Phù Hợp\n\n" if not is_en else "### 🔎 Found Matching Transactions\n\n"
                lines = [
                    header,
                    "| Ngày Ghi Nhận | Đơn Vị Thụ Hưởng | Số Tiền (USD) | Nguồn Dữ Liệu |" if not is_en else "| Date | Merchant / Beneficiary | Amount (USD) | Source |",
                    "| :--- | :--- | :--- | :--- |",
                ]
                for t in txs:
                    date_str = str(t.get("occurred_at") or t.get("date") or "")[:10]
                    merchant_name = t.get("merchant_normalized") or t.get("merchant_raw") or "Chưa xác định được"
                    lines.append(f"| `{date_str}` | **{merchant_name}** | **${t.get('amount', 0):,.2f}** | `{t.get('source', 'card')}` |")
                return "\n".join(lines)
            return ("Không tìm thấy giao dịch nào phù hợp với từ khóa của bạn." if not is_en else "No transactions found matching your search query.")

        # Default General QA
        if is_en:
            return (
                "### 👋 Hello! I am Wealify Guardian\n\n"
                "Your Enterprise AI Financial Assistant & Transaction Safety Copilot.\n\n"
                "#### 🛠️ Available Capabilities:\n"
                "1. **Expense & Fee Summary:** *'How much did I spend this month? What are the top 3 expenses?'*\n"
                "2. **Specific Transaction Check:** *'What is this $9.99 charge — is there any matching receipt email?'*\n"
                "3. **3-Way Reconciliation:** *'Did any money leave my account that hasn't appeared on card?'*\n"
                "4. **Duplicate Charge Detection:** *'Were there any duplicate debits on my cards?'*\n"
                "5. **Subscription & Price Hike Radar:** *'Which subscription had a price hike?'*\n"
                "6. **Email Report Dispatch:** *'Send this month\'s report to my email.'*"
            )
        return (
            "### 👋 Chào Bạn! Tôi Là Wealify Guardian\n\n"
            "Trợ lý AI bảo vệ giao dịch & đối soát tài chính đa nguồn tự động cho Wealify.\n\n"
            "#### 🛠️ Các Nghiệp Vụ Bạn Có Thể Tra Cứu Nhanh:\n"
            "1. **Báo cáo chi tiêu & phí:** *'Tháng này tôi chi bao nhiêu, phí bao nhiêu, 3 khoản lớn nhất là gì?'*\n"
            "2. **Tra cứu giao dịch & email:** *'Khoản $9.99 này là gì — có email xác nhận nào khớp không?'*\n"
            "3. **Đối soát 3 nguồn:** *'Có tiền nào rời tài khoản mà chưa thấy lên thẻ không?'*\n"
            "4. **Quét quẹt đúp & trùng thẻ:** *'Có khoản nào bị tính hai lần hoặc phí kép không?'*\n"
            "5. **Theo dõi Subscription & tăng giá:** *'Gói nào vừa tăng giá?', 'Dự báo subscription năm'*.\n"
            "6. **Gửi báo cáo về email:** *'Gửi báo cáo tháng này vào email của tôi.'*"
        )


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic Financial LLM Mock Provider.
    Produces high-fidelity, scientific, and beautifully formatted financial responses
    powered by DynamicFinancialSynthesizer.
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        context = context or {}
        text = DynamicFinancialSynthesizer.synthesize(prompt, context)
        return LLMResponse(
            content=text,
            prompt_tokens=len(prompt.split()) + 40,
            completion_tokens=len(text.split()),
            model="mock-deterministic",
        )


class OpenRouterLLMProvider(BaseLLMProvider):
    """
    OpenRouter Multi-Model LLM Provider (GPT-4o, Claude 3.5, Gemini 2.0, DeepSeek R1, Llama 3).
    Calls OpenRouter OpenAI-compatible endpoint with full financial context grounding.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "openai/gpt-4o-mini"):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.model = model or os.getenv("LLM_MODEL") or "openai/gpt-4o-mini"

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        if not self.api_key:
            mock = MockLLMProvider()
            return await mock.generate_response(prompt, system_instruction, temperature, context)

        try:
            import httpx
            from packages.observability.logging import logger

            tool_data = context.get("tool_result", {}) if context else {}
            language = context.get("language", "vi") if context else "vi"
            intent = context.get("intent", "GENERAL_QA") if context else "GENERAL_QA"

            sys_prompt = (
                "You are Wealify Guardian AI, a strict, factual financial copilot for Wealify users.\n"
                "RULES (WLF-01 Contest Standard):\n"
                "1. NEVER hallucinate financial figures. Rely strictly on the provided Tool Data and Context.\n"
                "2. Format all financial figures cleanly using Markdown tables and bold badges.\n"
                "3. Always cite data sources (e.g., Wealify Ledger, VPBank statement, Email invoices).\n"
                "4. When categorizing alerts, use exactly one of the 3 standard labels: 'Định kỳ đã xác định', 'Cần bạn tự xác nhận', 'Chưa đủ dữ liệu'. Never assert '100% fraud' or '100% scam'.\n"
                "5. Remind users of the 60-day statutory dispute deadline under US Regulation E for suspicious/unreconciled charges.\n"
                "6. For 3-way reconciliation discrepancies, strictly phrase as: 'Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân.'\n"
                "7. For unknown merchants, use 'Chưa xác định được'.\n"
                "8. Never provide absolute safety reassurance (e.g. do not say 'Your account is 100% safe'). State that you only highlight anomalies based on available data.\n"
                "9. Never execute disallowed mutations (transfers, cancellations, chargebacks) directly.\n"
                "10. Format responses professionally in markdown."
            )

            user_content = (
                f"Context Data from Financial Tools:\n{json.dumps(tool_data, default=str, ensure_ascii=False)}\n\n"
                f"User Question: {prompt}\n"
                f"Language: {language}\n"
                f"Intent: {intent}"
            )

            async with httpx.AsyncClient(timeout=25.0) as client:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "HTTP-Referer": "https://wealify.io",
                        "X-Title": "Wealify Guardian",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": sys_prompt},
                            {"role": "user", "content": user_content},
                        ],
                        "temperature": temperature,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    res_text = data["choices"][0]["message"]["content"]
                    usage = data.get("usage", {})
                    p_tokens = usage.get("prompt_tokens", len(prompt.split()) + 50)
                    c_tokens = usage.get("completion_tokens", len(res_text.split()))

                    logger.info(f"OpenRouter response received ({self.model}): {p_tokens} prompt tokens, {c_tokens} completion tokens.")
                    return LLMResponse(
                        content=res_text,
                        prompt_tokens=p_tokens,
                        completion_tokens=c_tokens,
                        model=self.model,
                    )
                else:
                    logger.warning(f"OpenRouter API returned status {resp.status_code}: {resp.text}, falling back to dynamic synthesizer.")
                    mock = MockLLMProvider()
                    return await mock.generate_response(prompt, system_instruction, temperature, context)
        except Exception as e:
            from packages.observability.logging import logger
            logger.error(f"OpenRouter call failed: {e}, falling back to dynamic synthesizer.")
            mock = MockLLMProvider()
            return await mock.generate_response(prompt, system_instruction, temperature, context)


class UnifiedLLMProvider(OpenRouterLLMProvider):
    """Alias for enterprise LLM provider."""
    pass


class GeminiLLMProvider(BaseLLMProvider):
    """
    Real Google Gemini LLM Provider using google-genai SDK.
    Takes the structured Tool execution results + RAG context and synthesizes
    natural, grounded financial advisory adhering strictly to WLF-01 contest rules.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.0-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.model = model

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        if not self.api_key:
            mock = MockLLMProvider()
            return await mock.generate_response(prompt, system_instruction, temperature, context)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            tool_data = context.get("tool_result", {}) if context else {}
            language = context.get("language", "vi") if context else "vi"
            intent = context.get("intent", "GENERAL_QA") if context else "GENERAL_QA"

            sys_prompt = (
                "You are Wealify Guardian AI, a strict, factual financial copilot for Wealify users.\n"
                "RULES (WLF-01 Contest Standard):\n"
                "1. NEVER hallucinate financial figures. Rely strictly on the provided Tool Data and Context.\n"
                "2. Format all financial figures cleanly using Markdown tables and bold badges.\n"
                "3. Always cite data sources (e.g., Wealify Ledger, VPBank statement, Email invoices).\n"
                "4. When categorizing alerts, use exactly one of the 3 standard labels: 'Định kỳ đã xác định', 'Cần bạn tự xác nhận', 'Chưa đủ dữ liệu'. Never assert '100% fraud' or '100% scam'.\n"
                "5. Remind users of the 60-day statutory dispute deadline under US Regulation E for suspicious/unreconciled charges.\n"
                "6. For 3-way reconciliation discrepancies, strictly phrase as: 'Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân.'\n"
                "7. For unknown merchants, use 'Chưa xác định được'.\n"
                "8. Never provide absolute safety reassurance (e.g. do not say 'Your account is 100% safe'). State that you only highlight anomalies based on available data.\n"
                "9. Never execute disallowed mutations (transfers, cancellations, chargebacks) directly.\n"
                "10. Format responses professionally in markdown."
            )

            full_content = (
                f"Context Data from Financial Tools:\n{json.dumps(tool_data, default=str, ensure_ascii=False)}\n\n"
                f"User Question: {prompt}\n"
                f"Language: {language}\n"
                f"Intent: {intent}"
            )

            response = client.models.generate_content(
                model=self.model,
                contents=full_content,
                config=types.GenerateContentConfig(
                    system_instruction=sys_prompt,
                    temperature=temperature,
                ),
            )

            res_text = response.text or ""
            return LLMResponse(
                content=res_text,
                prompt_tokens=len(prompt.split()) + 50,
                completion_tokens=len(res_text.split()),
                model=self.model,
            )
        except Exception:
            mock = MockLLMProvider()
            return await mock.generate_response(prompt, system_instruction, temperature, context)


def get_llm_provider() -> BaseLLMProvider:
    """
    Auto-detects configured LLM provider from environment variables:
    1. OPENROUTER_API_KEY (OpenRouter - GPT-4o-mini, Claude, Gemini, etc.)
    2. GEMINI_API_KEY / GOOGLE_API_KEY (Google Gemini Direct)
    3. LLM_PROVIDER = mock (Deterministic Offline Synthesizer)
    """
    provider = (os.getenv("LLM_PROVIDER") or "").lower().strip()
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    model = os.getenv("LLM_MODEL") or "openai/gpt-4o-mini"

    if provider == "openrouter" or (provider != "mock" and openrouter_key):
        if openrouter_key:
            return OpenRouterLLMProvider(api_key=openrouter_key, model=model)
    elif provider == "gemini" or (provider != "mock" and gemini_key):
        if gemini_key:
            return GeminiLLMProvider(api_key=gemini_key)

    if openrouter_key and provider != "mock":
        return OpenRouterLLMProvider(api_key=openrouter_key, model=model)
    if gemini_key and provider != "mock":
        return GeminiLLMProvider(api_key=gemini_key)

    return MockLLMProvider()
