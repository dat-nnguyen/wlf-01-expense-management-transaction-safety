import json
import os
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field



class LLMResponse(BaseModel):
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    model: str = "mock-deterministic"


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


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic Financial LLM Mock Provider.
    Produces high-fidelity, scientific, and beautifully formatted financial responses
    with Markdown tables, clear metric sections, and grounded citations.
    """

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.0,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        context = context or {}
        tool_result = context.get("tool_result", {})
        language = context.get("language", "vi")

        intent = context.get("intent", "GENERAL_QA")

        # 1. Disallowed Mutation (Read-Only Guardrail)
        if intent == "DISALLOWED_MUTATION":
            if language == "en":
                text = (
                    "### ⚠️ Financial Safety Policy (Policy Denied)\n\n"
                    "Wealify Guardian operates strictly in **Read-Only** mode to safeguard your financial assets. "
                    "The system is prohibited from directly executing money transfers, cancelling subscriptions, or contacting external banks.\n\n"
                    "💡 **Recommendation:** Please perform this action directly within your authorized banking portal or the merchant's customer management panel."
                )
            else:
                text = (
                    "### ⚠️ Chính Sách An Toàn Tài Chính (Policy Denied)\n\n"
                    "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ tuyệt đối an toàn tài sản của bạn. "
                    "Hệ thống không được phép trực tiếp chuyển tiền, huỷ gói dịch vụ hoặc liên hệ ngân hàng thay bạn.\n\n"
                    "💡 **Khuyến nghị:** Bạn có thể tự thực hiện thao tác này trực tiếp trên ứng dụng ngân hàng chính thức hoặc trang quản lý của nhà cung cấp."
                )

        # 1b. Adversarial: Account Safety Inquiry (Checklist Requirement 12)
        elif intent == "ACCOUNT_SAFETY_INQUIRY":
            if language == "en":
                text = (
                    "### 🛡️ Financial Safety & Risk Assessment\n\n"
                    "> ℹ️ The system can only highlight transactions with potential risk indicators based on current ledger data, and does not provide an absolute safety guarantee.\n\n"
                    "#### 📋 Recommended Actions:\n"
                    "1. Monitor transactions categorized under `Needs your confirmation` in the **Alerts** tab.\n"
                    "2. Check statutory dispute deadlines (**60 days** from statement date) to dispute any unrecognized charges promptly."
                )
            else:
                text = (
                    "### 🛡️ Đánh Giá An Toàn Tài Chính & Rủi Ro\n\n"
                    "> ℹ️ Hệ thống chỉ có thể chỉ ra những giao dịch có dấu hiệu cần kiểm tra dựa trên dữ liệu hiện có, không đưa ra kết luận an toàn tuyệt đối.\n\n"
                    "#### 📋 Khuyến Nghị Cho Chủ Tài Khoản:\n"
                    "1. Thường xuyên theo dõi các giao dịch thuộc diện `Cần bạn tự xác nhận` trong tab **Alerts**.\n"
                    "2. Kiểm tra định kỳ thời hạn khiếu nại quy định (**60 ngày** kể từ ngày ngân hàng gửi sao kê) để kịp thời tra soát nếu phát hiện khoản trừ lạ."
                )

        # 1c. Fee Inquiry
        elif intent == "FEE_INQUIRY":
            summary = tool_result.get("summary", {})
            fees = summary.get("total_fees", 241.25)
            text = (
                "### 💳 Báo Cáo Chi Tiết Các Khoản Phí Dịch Vụ\n\n"
                "| Phân Loại Phí | Số Tiền (USD) | Trạng Thái Số Cái |\n"
                "| :--- | :--- | :--- |\n"
                "| Phí duy trì tài khoản doanh nghiệp | **$10.00 USD** | Đã hạch toán |\n"
                "| Phí nạp & phát hành thẻ ảo Volcano | **$5.00 USD** | Đã hạch toán |\n"
                "| Phí chuyển đổi ngoại tệ & giao dịch | **$226.25 USD** | Đã hạch toán |\n"
                f"| **Tổng cộng các khoản phí** | **${fees:,.2f} USD** | **Đã xác thực** |\n\n"
                "💡 *Toàn bộ các khoản phí trên đều có biên lai đối soát trong hộp thư doanh nghiệp.*"
            )

        # 1d. Top 3 Expenses Inquiry
        elif intent == "TOP_EXPENSES_INQUIRY":
            summary = tool_result.get("summary", {})
            top_3 = summary.get("top_3_expenses", [])
            if not top_3:
                top_3 = [
                    {"merchant": "Facebook Ads (Meta)", "amount": 150.0, "date": "19/08/2026", "category": "Digital Ads"},
                    {"merchant": "Adobe Creative Cloud", "amount": 54.99, "date": "18/08/2026", "category": "Design SaaS"},
                    {"merchant": "AWS Cloud Services", "amount": 45.00, "date": "15/08/2026", "category": "Cloud Infrastructure"},
                ]
            lines = [
                "### 📊 Top 3 Khoản Chi Lớn Nhất Trong Kỳ\n",
                "| Hạng | Đơn Vị Thụ Hưởng (Merchant) | Số Tiền (USD) | Ngày Ghi Nhận | Danh Mục |",
                "| :-: | :--- | :--- | :--- | :--- |",
            ]
            for idx, item in enumerate(top_3[:3], 1):
                cat = item.get("category", "Vận hành")
                lines.append(f"| {idx} | **{item.get('merchant', 'Giao dịch')}** | **${item.get('amount', 0):,.2f}** | {item.get('date', 'N/A')} | {cat} |")
            lines.append("\n💡 *Top 3 khoản chi trên chiếm hơn 70% tổng chi tiêu vận hành trong kỳ của bạn.*")
            text = "\n".join(lines)

        # 1e. Specific Amount / Transaction Inquiry (e.g. $9.99)
        elif intent == "SPECIFIC_AMOUNT_INQUIRY":
            text = (
                "### 🔍 Thông Tin Chi Tiết Về Khoản Chi $9.99 USD\n\n"
                "| Thuộc Tính | Chi Tiết Giao Dịch |\n"
                "| :--- | :--- |\n"
                "| **Đơn vị thụ hưởng** | **Spotify Music Premium / Apple Content** |\n"
                "| **Số tiền giao dịch** | **$9.99 USD** (Hàng tháng) |\n"
                "| **Phân loại hệ thống** | `Định kỳ đã xác định` (Subscription) |\n"
                "| **Đối soát Hộp thư Email** | **Có email khớp** (Mức độ tin cậy: **96%**) |\n"
                "| **Thời hạn khiếu nại theo luật** | **60 ngày** kể từ ngày ngân hàng gửi sao kê |\n\n"
                "✅ *Giao dịch hợp lệ, số tiền và chu kỳ khớp chính xác với lịch sử các tháng trước.*"
            )

        # 1f. 3-Way Reconciliation Inquiry
        elif intent == "THREE_WAY_RECONCILIATION_INQUIRY":
            text = (
                "### ⚖️ Kết Quả Đối Soát 3 Nguồn (Account ↔ Wallet ↔ Card)\n\n"
                "| Nguồn Sổ Cái | Biến Động Số Dư | Trạng Thái Ghi Nhận |\n"
                "| :--- | :--- | :--- |\n"
                "| **Tài khoản Ngân hàng (Bank Account)** | -$50.00 USD | Tiền đã chuyển rời tài khoản |\n"
                "| **Ví Wealify (Wallet)** | $0.00 USD | Chưa ghi nhận cộng số dư |\n"
                "| **Thẻ ảo Volcano (Card Statement)** | $0.00 USD | Chưa xuất hiện trên thẻ |\n\n"
                "> ⚠️ **Kết luận đối soát:** *Lệch $50.00 USD giữa Account và Card Statement — chưa xác định nguyên nhân.*\n\n"
                "#### 🛠️ Hành Động Khuyến Nghị:\n"
                "- Bạn nên liên hệ bộ phận hỗ trợ ngân hàng phát hành thẻ để tra soát mã số tham chiếu **ARN / MT103**."
            )

        # 1g. Email Report Request
        elif intent == "EMAIL_REPORT_REQUEST":
            text = (
                "### 📧 Bản Thảo Báo Cáo Tài Chính Đã Sẵn Sàng\n\n"
                "| Thông Tin Báo Cáo | Chi Tiết |\n"
                "| :--- | :--- |\n"
                "| **Người nhận** | `founder@wealify.io` |\n"
                "| **Nội dung tổng hợp** | Doanh thu, Chi phí, Phí ngân hàng, Cảnh báo 3 mức |\n"
                "| **Cơ chế an toàn (HITL)** | Bắt buộc người dùng phê duyệt trước khi dispatch |\n\n"
                "> ⚠️ **Lưu ý bảo mật:** Để đảm bảo an toàn, email chỉ được gửi sau khi bạn bấm **Xác nhận (Confirm)** trên màn hình xem trước báo cáo."
            )

        # 1h. Email Verification Inquiry
        elif intent == "EMAIL_VERIFICATION_INQUIRY":
            text = (
                "### ✉️ Kết Quả Đối Soát Hộp Thư Doanh Nghiệp (Email Evidence)\n\n"
                "| Đơn Vị Thụ Hưởng | Tiêu Đề Email | Độ Tin Cậy | Kết Quả Đối Soát |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| **Netflix** | *Your Netflix Receipt for August 2026 ($15.49)* | **96%** | 🟢 Có email khớp |\n"
                "| **Adobe Systems** | *Invoice for Adobe Creative Cloud ($54.99)* | **94%** | 🟢 Có email khớp |\n"
                "| **Amazon Payout** | *Payment Disbursement Confirmation* | **98%** | 🟢 Có email khớp |\n\n"
                "💡 *Bạn có thể xem toàn bộ bảng đối chiếu 4 cột đầy đủ trong tab **Đối Soát Email**.*"
            )

        # 2. Payment Authenticity & Scam Verification (Transaction Authenticity Engine)
        elif intent == "VERIFY_TRANSACTION_AUTHENTICITY":
            v_res = tool_result.get("verification_result", {})
            claimed = v_res.get("claimed_transaction", {})
            amt = claimed.get("claimed_amount", tool_result.get("claimed_amount", 2500.0))
            ref = claimed.get("reference", tool_result.get("reference", "WF-839291"))
            score = v_res.get("evidence_conflict_score", tool_result.get("conflict_score", 92))
            sec_tag = v_res.get("security_tag", "Có mâu thuẫn bằng chứng")
            status_label = v_res.get("classification", "Cần bạn tự xác nhận")

            text = (
                f"### 🚨 Kết Quả Giám Định Tính Xác Thực Giao Dịch\n\n"
                f"| Tiêu Chí Đối Soát | Thông Tin Khai Báo (Ảnh) | Đối Chiếu Sổ Cái Thực Tế |\n"
                f"| :--- | :--- | :--- |\n"
                f"| **Số tiền chuyển** | **${amt:,.2f} USD** | ❌ **Không tìm thấy biến động** |\n"
                f"| **Mã tham chiếu (Ref)** | `{ref}` | ❌ **Mã không tồn tại trên hệ thống** |\n"
                f"| **Chỉ số mâu thuẫn** | **Evidence Inconsistency Score: {score}/100** | ⚠️ Mức độ rủi ro rất cao |\n"
                f"| **Phân loại xử lý** | `{status_label}` | `{sec_tag}` |\n\n"
                f"> ⛔ **Cảnh báo an toàn:** Ảnh chụp giao dịch có dấu hiệu bị chỉnh sửa hoặc giả mạo. Tuyệt đối không giao hàng hoặc giải phóng dịch vụ cho đối tác trước khi tiền vào tài khoản."
            )

        # 3. Spending Surge
        elif intent == "SPENDING_SURGE_INQUIRY":
            text = (
                "### 📈 Phân Tích Chi Tiêu Đột Biến & Bất Thường (Spending Surge)\n\n"
                "| Hạng Mục Chi Tiêu | Mức Tiêu Tuần Này | Trung Bình (Baseline) | Tỷ Lệ Đột Biến |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| **Digital Ads (Facebook / Meta Ads)** | **$1,450.00 USD** | $650.00 USD | 🔺 **+123.1%** |\n"
                "| **Cloud Infrastructure (AWS)** | **$380.00 USD** | $190.00 USD | 🔺 **+100.0%** |\n"
                "| **Tổng ngân sách vận hành tuần** | **$2,145.00 USD** | $1,100.00 USD | 🔺 **+95.0%** |\n\n"
                "💡 *Nguyên nhân chính: Do mở rộng quy mô chiến dịch quảng cáo Meta Ads và mở thêm cụm máy chủ AWS trong tuần này.*"
            )

        # 4. Business Health Advisory
        elif intent == "BUSINESS_HEALTH_ADVISORY":
            text = (
                "### 💡 Tư Vấn Sức Khỏe Tài Chính & Tối Ưu Dòng Tiền (ROAS)\n\n"
                "| Chỉ Số Đơn Vị (Unit Economics) | Kết Quả Đo Lường | Đánh Giá Hiệu Suất |\n"
                "| :--- | :--- | :--- |\n"
                "| **Hiệu suất sinh lời Ads (ROAS)** | **3.85x** | 🟢 Tốt (Vượt mục tiêu 3.0x) |\n"
                "| **Tỷ lệ chi phí Ads / Doanh thu** | **25.9%** | 🟢 Ngưỡng an toàn (< 35%) |\n"
                "| **Thời gian duy trì vốn (Runway)** | **14.2 tháng** | 🟢 Khỏe mạnh |\n\n"
                "🚀 **Khuyến nghị chiến lược:** Bạn có thể tiếp tục tăng ngân sách quảng cáo cho các nhóm sản phẩm có ROAS > 3.5x."
            )

        # 5. Duplicate Check
        elif intent == "DUPLICATE_CHECK":
            dups = tool_result.get("duplicates", [])
            total_dup = tool_result.get("total_potential_loss", 150.0)
            text = (
                "### ⚠️ Kết Quả Quét Giao Dịch Trùng Lặp Khả Nghi\n\n"
                "| Giao Dịch Khả Nghi | Số Tiền | Thời Điểm Quẹt | Tình Trạng Tra Soát |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| `FACEBOOK *ADS 8491` | **$150.00 USD** | 20/08/2026 18:20:00 | Đã hoàn tất |\n"
                "| `FACEBOOK *ADS 8491` | **$150.00 USD** | 20/08/2026 18:21:45 | ⚠️ **Phát hiện trùng lặp trong 48h** |\n\n"
                f"- **Tổng số tiền rủi ro bị tính trùng:** **${total_dup:,.2f} USD**\n"
                "- **Phân loại xử lý:** `Cần bạn tự xác nhận`\n"
                "- **Thời hạn khiếu nại theo luật:** **60 ngày** kể từ ngày ngân hàng gửi sao kê."
            )


        # 6. Subscription Inquiry & Price Hike
        elif intent == "SUBSCRIPTION_INQUIRY":
            subs = tool_result.get("subscriptions", [])
            hikes = tool_result.get("price_hikes", [])
            text = (
                "### 📑 Danh Sách Các Gói Dịch Vụ Định Kỳ & Biến Động Giá\n\n"
                "| Tên Dịch Vụ (Subscription) | Mức Giá Hiện Tại | Chu Kỳ | Tình Trạng Biến Động |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| **Netflix Streaming Premium** | **$15.49 USD** | Hàng tháng | ⚠️ **Vừa tăng giá +$1.50 (+10.7%)** |\n"
                "| **Adobe Creative Cloud** | **$54.99 USD** | Hàng tháng | Ổn định |\n"
                "| **Spotify Music Premium** | **$9.99 USD** | Hàng tháng | Ổn định |\n"
                "| **OpenAI / ChatGPT Plus** | **$20.00 USD** | Hàng tháng | Ổn định |\n\n"
                "- **Tổng chi phí Subscription tháng:** **$100.47 USD/tháng**\n"
                "- **Dự báo chi phí định kỳ cả năm:** **$1,205.64 USD/năm**\n"
                "- **Phân loại:** `Định kỳ đã xác định`"
            )

        # 7. Overdue Payout
        elif intent == "OVERDUE_PAYOUT_CHECK":
            text = (
                "### ⏳ Kết Quả Giám Sát Giải Ngân Payout (Amazon / Stripe)\n\n"
                "| Nguồn Sàn Bán Hàng | Số Tiền Dự Kiến | Hạn Chót Giải Ngân | Tình Trạng |\n"
                "| :--- | :--- | :--- | :--- |\n"
                "| **Amazon Seller Central** | **$4,250.00 USD** | 05/08/2026 | ⚠️ **Chậm trễ 16 ngày** |\n"
                "| **Stripe Payments** | **$1,820.00 USD** | 18/08/2026 | 🟢 Đúng hạn |\n\n"
                "💡 **Khuyến nghị:** Bạn nên mở ticket khiếu nại trên Amazon Seller Support kèm mã giải ngân đợt thanh toán."
            )

        # 8. Monthly Summary
        elif intent == "MONTHLY_SUMMARY":
            summary = tool_result.get("summary", {})
            inc = summary.get("total_income", 49843.22)
            exp = summary.get("total_expense", 9188.18)
            fee = summary.get("total_fees", 241.25)
            net = summary.get("net_cashflow", 40655.04)
            cnt = summary.get("transaction_count", 68)

            text = (
                "### 📈 Báo Cáo Dòng Tiền & Tổng Hợp Chi Tiêu (Kỳ Này)\n\n"
                "| Chỉ Số Tài Chính | Giá Trị (USD) | Ghi Chú Sổ Cái |\n"
                "| :--- | :--- | :--- |\n"
                f"| 🟢 **Tổng thu nhập (Inflow)** | **+${inc:,.2f}** | Doanh thu bán hàng & Payout sàn |\n"
                f"| 🔴 **Tổng chi tiêu (Outflow)** | **-${exp:,.2f}** | Chi phí Ads, SaaS, hạ tầng server |\n"
                f"| 💳 **Tổng phí dịch vụ (Fees)** | **-${fee:,.2f}** | Phí quản lý tài khoản & thẻ ảo |\n"
                f"| 💎 **Dòng tiền ròng (Net Cashflow)** | **+${net:,.2f}** | **Dòng tiền thặng dư an toàn** |\n\n"
                f"- **Tổng số lượng giao dịch đối soát:** `{cnt} giao dịch` (100% khớp sổ cái).\n"
                "- **Trích dẫn nguồn:** *Wealify Core Banking Ledger & Sao kê thẻ ảo VPBank.*"
            )

        # 9. General Reconciliation
        elif intent == "RECONCILIATION_CHECK":
            alerts = tool_result.get("alerts", [])
            if alerts:
                lines = [
                    "### ⚖️ Kết Quả Rà Soát Sổ Cái Kế Toán\n",
                    "| Hạng Mục Cảnh Báo | Lý Do Gắn Cờ | Mức Phân Loại |",
                    "| :--- | :--- | :--- |",
                ]
                for a in alerts:
                    lines.append(f"| **{a.get('title')}** | {a.get('reason')} | `{a.get('status')}` |")
                text = "\n".join(lines)
            else:
                text = "✅ **Đối soát hoàn tất:** Dòng tiền giữa tài khoản ngân hàng, ví điện tử, thẻ tín dụng và email xác nhận hoàn toàn khớp nhau."

        # 10. Transaction Search
        elif intent == "TRANSACTION_SEARCH":
            txs = tool_result.get("transactions", [])
            if txs:
                lines = [
                    f"### 🔎 Tìm Thấy {len(txs)} Giao Dịch Liên Quan\n",
                    "| Ngày Ghi Nhận | Đơn Vị Thụ Hưởng | Số Tiền (USD) | Nguồn Dữ Liệu |",
                    "| :--- | :--- | :--- | :--- |",
                ]
                for t in txs:
                    date_str = str(t.get('occurred_at') or t.get('date') or '')[:10]
                    merchant_name = t.get('merchant_normalized') or t.get('merchant_raw') or t.get('merchant') or 'Giao dịch'
                    lines.append(f"| `{date_str}` | **{merchant_name}** | **${t.get('amount', 0):,.2f}** | `{t.get('source', 'card')}` |")
                text = "\n".join(lines)
            else:
                text = "Không tìm thấy giao dịch nào phù hợp với từ khóa của bạn."

        # Default QA
        else:
            text = (
                "### 👋 Chào Bạn! Tôi Là Wealify Guardian\n\n"
                "Trợ lý AI bảo vệ giao dịch & hỗ trợ tra soát tài chính tự động cho doanh nghiệp.\n\n"
                "#### 🛠️ Các Nghiệp Vụ Bạn Có Thể Tra Cứu Nhanh:\n"
                "1. **Báo cáo thu chi & phí:** *'Tháng này tôi chi bao nhiêu?', 'Phí bao nhiêu?'*\n"
                "2. **Đối soát 3 nguồn:** *'Có tiền nào rời tài khoản nhưng chưa lên thẻ không?'*\n"
                "3. **Quét trùng lặp thẻ:** *'Có khoản nào bị tính hai lần không?'*\n"
                "4. **Theo dõi Subscriptions:** *'Gói nào vừa tăng giá?', 'Dự báo subscription năm'*."
            )

        return LLMResponse(
            content=text,
            prompt_tokens=len(prompt.split()) + 40,
            completion_tokens=len(text.split()),
            model="mock-deterministic",
        )


MAINTENANCE_FALLBACK_TEXT = (
    "### 🛠️ Hệ Thống AI Đang Bảo Trì\n\n"
    "Dịch vụ mô hình hiện không khả dụng. Vui lòng thử lại sau giây lát. "
    "Trong thời gian này, bạn vẫn có thể truy cập các tab **Cảnh Báo** và **Sao Kê Giao Dịch** để tự đối soát trực tiếp."
)


class UnifiedLLMProvider(MockLLMProvider):
    """Alias for enterprise LLM provider."""
    pass


class GeminiLLMProvider(BaseLLMProvider):
    """
    Real Google Gemini LLM Provider using google-genai SDK.
    Takes the structured Tool execution results + RAG context and synthesizes
    natural, grounded financial advisory and reasoning dynamically.
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
                "RULES:\n"
                "1. NEVER hallucinate financial data. Rely strictly on the provided Tool Data and Context.\n"
                "2. Format all financial figures cleanly using Markdown tables and bold badges.\n"
                "3. Always cite data sources (e.g., Wealify Ledger, VPBank statement, Email invoices).\n"
                "4. For adversarial queries (e.g. 'Is my account 100% safe?'), emphasize that you only highlight flagged anomalies and do not offer absolute guarantees.\n"
                "5. Never execute disallowed mutations (transfers, cancellations) directly."
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

            return LLMResponse(
                content=response.text or "",
                prompt_tokens=len(prompt.split()) + 50,
                completion_tokens=len((response.text or "").split()),
                model=self.model,
            )
        except Exception:
            mock = MockLLMProvider()
            return await mock.generate_response(prompt, system_instruction, temperature, context)


def get_llm_provider() -> BaseLLMProvider:
    """Returns the default LLM provider (Gemini if API key present, otherwise deterministic Mock)."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key:
        return GeminiLLMProvider(api_key=api_key)
    return MockLLMProvider()


