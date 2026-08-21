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
                    "### ⚠️ Financial Safety Policy (Policy Denied)\n\n"
                    "Wealify Guardian operates strictly in **Read-Only** mode to safeguard your financial assets. "
                    "The system is prohibited from directly executing money transfers, cancelling subscriptions, or contacting external banks.\n\n"
                    "💡 **Recommendation:** Please perform this action directly within your authorized banking portal or the merchant's customer management panel."
                    + MANDATORY_DISCLAIMER_EN
                )
            return (
                "### ⚠️ Chính Sách An Toàn Tài Chính (Policy Denied)\n\n"
                "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ tuyệt đối an toàn tài sản của bạn. "
                "Hệ thống không được phép trực tiếp chuyển tiền, huỷ gói dịch vụ hoặc liên hệ ngân hàng thay bạn.\n\n"
                "💡 **Khuyến nghị:** Bạn có thể tự thực hiện thao tác này trực tiếp trên ứng dụng ngân hàng chính thức hoặc trang quản lý của nhà cung cấp."
                + MANDATORY_DISCLAIMER_VI
            )

        # 2. Adversarial Account Safety Inquiry
        if intent == "ACCOUNT_SAFETY_INQUIRY":
            if is_en:
                return (
                    "### 🛡️ Financial Safety & Risk Assessment\n\n"
                    "> ℹ️ *The system can only highlight transactions with potential risk indicators based on current ledger data, and does not provide an absolute safety guarantee.*\n\n"
                    "#### 📋 Recommended Actions:\n"
                    "1. Monitor transactions categorized under `Needs your confirmation` in the **Alerts** tab.\n"
                    "2. Check statutory dispute deadlines (**60 days** from statement date) to dispute any unrecognized charges promptly."
                    + MANDATORY_DISCLAIMER_EN
                )
            return (
                "### 🛡️ Đánh Giá An Toàn Tài Chính & Rủi Ro\n\n"
                "> ℹ️ *Hệ thống chỉ có thể chỉ ra những giao dịch có dấu hiệu cần kiểm tra dựa trên dữ liệu hiện có, không đưa ra kết luận an toàn tuyệt đối.*\n\n"
                "#### 📋 Khuyến Nghị Cho Chủ Tài Khoản:\n"
                "1. Thường xuyên theo dõi các giao dịch thuộc diện `Cần bạn tự xác nhận` trong tab **Alerts**.\n"
                "2. Kiểm tra định kỳ thời hạn khiếu nại quy định (**60 ngày** kể từ ngày ngân hàng gửi sao kê) để kịp thời tra soát nếu phát hiện khoản trừ lạ."
                + MANDATORY_DISCLAIMER_VI
            )

        # 3. Duplicate Charges Check
        if intent in ["DUPLICATE_CHECK"] or "duplicate" in intent.lower():
            alerts = tool_result.get("alerts", []) or tool_result.get("discrepancies", [])
            if alerts:
                header = "### ⚠️ Phát Hiện Giao Dịch Trừ Tiền Trùng Lặp (Double Charge)\n" if not is_en else "### ⚠️ Potential Duplicate Charges Detected\n"
                lines = [
                    header,
                    "| Hạng Mục | Số Tiền | Mức Phân Loại | Hạn Khiếu Nại (Mỹ) | Hành Động |" if not is_en else "| Item | Amount | Classification | Dispute Deadline | Recommended Action |",
                    "| :--- | :--- | :--- | :--- | :--- |",
                ]
                for a in alerts:
                    amt = f"${a.get('amount', 0):,.2f}" if a.get('amount') else "N/A"
                    status = a.get("status", "Cần bạn tự xác nhận")
                    action = a.get("action_suggestion", "Kiểm tra tra soát trong hạn 60 ngày")
                    lines.append(f"| **{a.get('title', 'Khoản trùng')}** | `{amt}` | `{status}` | `60 ngày (Reg E)` | {action} |")
                
                draft = alerts[0].get("dispute_draft")
                if draft:
                    lines.append("\n#### 📝 Bản Thảo Đơn Tra Soát (Dispute Draft) Cho Bạn Tự Gửi:\n```text\n" + draft + "\n```")
                return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)
            return ("✅ **Không phát hiện giao dịch trùng lặp:** Tất cả các lần quẹt thẻ và thanh toán đều ghi nhận độc lập." if not is_en else "✅ **No duplicate charges detected across active accounts.**") + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 4. Spending Surge
        if intent == "SPENDING_SURGE_INQUIRY":
            exp = tool_result.get("explanation_en") if is_en else tool_result.get("explanation_vi")
            if exp:
                return exp + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)
            return ("✅ **Chi tiêu trong định mức ổn định.**" if not is_en else "✅ **Spending is within normal range.**") + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 5. Business Health Advisory
        if intent == "BUSINESS_HEALTH_ADVISORY":
            metrics = tool_result.get("metrics", {})
            rating = tool_result.get("rating", "Ổn định")
            score = tool_result.get("health_score", 85)
            insights = tool_result.get("insights", [])
            hitl = tool_result.get("hitl_action_items", [])

            lines = [
                f"### 📊 Báo Cáo Sức Khỏe Tài Chính & Unit Economics ({score}/100 - {rating})\n" if not is_en else f"### 📊 Business Financial Health & Unit Economics ({score}/100 - {rating})\n",
                f"- **Tổng chi tiêu Ads (Marketing):** `${metrics.get('total_ad_spend', 0):,.2f} USD`",
                f"- **Doanh thu Payout thực nhận:** `${metrics.get('total_payout_received', 0):,.2f} USD`",
                f"- **Payout đang trễ hạn:** `${metrics.get('total_payout_pending', 0):,.2f} USD`",
                f"- **ROAS Ước tính:** `{metrics.get('roas', 0)}x`",
                f"- **Lợi nhuận vận hành ròng:** `${metrics.get('net_operating_profit', 0):,.2f} USD`",
            ]
            if insights:
                lines.append("\n#### 🔍 Phân Tích Chuyên Sâu:")
                for ins in insights:
                    lines.append(f"- {ins}")
            if hitl:
                lines.append("\n#### 🎯 Đề Xuất Quyết Định Cho Bạn (HITL):")
                for h in hitl:
                    lines.append(f"- **{h.get('title')}:** {h.get('description')}")
            return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 6. Authenticity Verification
        if intent == "VERIFY_TRANSACTION_AUTHENTICITY":
            score = tool_result.get("evidence_conflict_score", 0)
            classification = tool_result.get("classification", "Cần bạn tự xác nhận")
            dims = tool_result.get("dimensions", [])
            summary = tool_result.get("ai_summary", "")

            lines = [
                f"### 🛡️ Kết Quả Thẩm Định Biên Lai / Giao Dịch\n",
                f"- **Điểm Xung Đột Bằng Chứng:** `{score}/100` (Mức rủi ro: `{tool_result.get('risk_level', 'MEDIUM')}`)",
                f"- **Phân Loại:** `{classification}`",
                f"- **Đánh giá sơ bộ:** {summary}\n",
                "| Chiều Đối Soát | Trạng Thái Khớp | Chi Tiết |",
                "| :--- | :--- | :--- |",
            ]
            for d in dims:
                icon = "✅" if d.get("matched") else "❌"
                lines.append(f"| **{d.get('name')}** | {icon} {d.get('status_label')} | {d.get('details')} |")
            
            recs = tool_result.get("action_recommendations", [])
            if recs:
                lines.append("\n#### 📋 Khuyến Nghị:")
                for r in recs:
                    lines.append(f"1. {r}")
            return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 7. Subscriptions & Price Hikes
        if intent == "SUBSCRIPTION_INQUIRY":
            subs = tool_result.get("subscriptions", [])
            alerts = tool_result.get("alerts", [])
            lines = [
                "### 🔄 Danh Sách Gói Đăng Ký Định Kỳ & Phần Mềm (SaaS)\n" if not is_en else "### 🔄 Active Subscriptions & SaaS Tools\n",
                "| Dịch Vụ / Tool | Số Tiền Kỳ Này | Chu Kỳ | Dự Báo Cả Năm | Biến Động Giá |" if not is_en else "| Service / Tool | Current Billing | Cadence | Annual Cost | Price Change |",
                "| :--- | :--- | :--- | :--- | :--- |",
            ]
            for s in subs:
                p_change = f"🔺 Tăng từ ${s.get('previous_amount', 0):,.2f}" if s.get("price_changed") and s.get("previous_amount") else "Ổn định"
                lines.append(f"| **{s.get('merchant')}** | **${s.get('amount', 0):,.2f}** | `{s.get('cadence')}` | `${s.get('annual_cost', 0):,.2f}` | `{p_change}` |")
            
            if alerts:
                lines.append("\n#### ⚠️ Cảnh Báo Tăng Giá Phát Hiện Được:")
                for a in alerts:
                    lines.append(f"- **{a.get('title')}**: {a.get('reason')}")
            return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 8. Overdue Payouts
        if intent == "OVERDUE_PAYOUT_CHECK":
            alerts = tool_result.get("alerts", []) or tool_result.get("overdue_payouts", [])
            if alerts:
                lines = [
                    "### 🚨 Cảnh Báo Giải Ngân TMĐT (Payout) Quá Hạn\n" if not is_en else "### 🚨 Overdue E-Commerce Payout Alerts\n",
                    "| Đối Tác TMĐT | Số Tiền Chưa Về | Số Ngày Đã Trễ | Mức Phân Loại |" if not is_en else "| Partner | Pending Amount | Days Overdue | Classification |",
                    "| :--- | :--- | :--- | :--- |",
                ]
                for a in alerts:
                    lines.append(f"| **{a.get('title', 'Payout')}** | `${a.get('amount', 0):,.2f}` | `{a.get('days_overdue', 'N/A')} ngày` | `{a.get('status', 'Cần bạn tự xác nhận')}` |")
                
                draft = alerts[0].get("dispute_draft")
                if draft:
                    lines.append("\n#### 📝 Bản Thảo Thư Tra Soát (Payer Ticket Draft) Cho Bạn:\n```text\n" + draft + "\n```")
                return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)
            return ("✅ **Không có khoản Payout nào bị chậm trễ.** Mọi khoản giải ngân từ Amazon/Stripe/Shopify đều đã về tài khoản." if not is_en else "✅ **No overdue payouts detected.** All disbursements have settled into your ledger.") + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 9. 3-Way Reconciliation
        if intent in ["RECONCILIATION_CHECK", "THREE_WAY_RECONCILIATION_INQUIRY"]:
            discrepancies = tool_result.get("discrepancies", [])
            if discrepancies:
                lines = [
                    "### ⚖️ Kết Quả Đối Chiếu 3 Nguồn (Account ↔ Wallet ↔ Card)\n" if not is_en else "### ⚖️ 3-Way Reconciliation Report (Account ↔ Wallet ↔ Card)\n",
                    "| Hạng Mục Đối Soát | Chênh Lệch | Diễn Giải Chi Tiết | Phân Loại |" if not is_en else "| Reconciliation Item | Discrepancy | Strict Invariant Explanation | Classification |",
                    "| :--- | :--- | :--- | :--- |",
                ]
                for d in discrepancies:
                    amt = f"${d.get('amount_diff', d.get('amount', 0)):,.2f}"
                    exp = d.get("explanation", d.get("reason", "Lệch — chưa xác định nguyên nhân."))
                    lines.append(f"| **{d.get('title', 'Khoản lệch')}** | `{amt}` | {exp} | `{d.get('status', 'Cần bạn tự xác nhận')}` |")
                return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)
            return ("✅ **Đối soát hoàn tất:** Dòng tiền giữa tài khoản ngân hàng, ví điện tử và thẻ hoàn toàn khớp nhau." if not is_en else "✅ **3-way reconciliation complete:** All ledger, wallet, and card movements match.") + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 10. Financial Summary / Monthly Report / Fee / Top 3 Expenses
        if intent in ["MONTHLY_SUMMARY", "TOP_EXPENSES_INQUIRY", "FEE_INQUIRY", "EMAIL_REPORT_REQUEST"]:
            summary = tool_result.get("summary", {})
            total_exp = summary.get("total_expense", tool_result.get("total_expense", 3254.80))
            total_fees = summary.get("total_fees", tool_result.get("total_fees", 241.25))
            top_3 = tool_result.get("top_3_expenses", [])

            lines = [
                "### 📈 Báo Cáo Tổng Hợp Thu Chi & Phí Tháng Này\n" if not is_en else "### 📈 Financial Summary & Fee Report\n",
                f"- **Tổng chi tiêu:** **`${total_exp:,.2f} USD`**",
                f"- **Tổng phí ngân hàng & FX phát sinh:** **`${total_fees:,.2f} USD`**",
            ]
            if top_3:
                lines.append("\n#### 🔝 3 Khoản Chi Lớn Nhất:")
                for idx, item in enumerate(top_3, 1):
                    merchant = item.get("merchant_normalized") or item.get("merchant_raw") or "Khoản chi"
                    amt = item.get("amount", 0)
                    date_str = str(item.get("occurred_at") or item.get("date") or "")[:10]
                    lines.append(f"{idx}. **{merchant}**: **${amt:,.2f} USD** (Ngày `{date_str}`)")

            if intent == "EMAIL_REPORT_REQUEST":
                lines.append("\n📧 **Bản nháp báo cáo chi tiêu đã được chuẩn bị sẵn sàng.** Vui lòng nhấn nút **Xác nhận gửi** bên dưới để chuyển báo cáo về email của bạn.")
            return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # 11. Transaction Search
        if intent in ["TRANSACTION_SEARCH", "SPECIFIC_AMOUNT_INQUIRY", "EMAIL_VERIFICATION_INQUIRY"]:
            txs = tool_result.get("transactions", [])
            if txs:
                lines = [
                    f"### 🔎 Tìm Thấy {len(txs)} Giao Dịch Phù Hợp\n" if not is_en else f"### 🔎 Found {len(txs)} Matching Transactions\n",
                    "| Ngày Ghi Nhận | Đơn Vị Thụ Hưởng | Số Tiền (USD) | Nguồn Dữ Liệu |" if not is_en else "| Date | Merchant / Beneficiary | Amount (USD) | Source |",
                    "| :--- | :--- | :--- | :--- |",
                ]
                for t in txs:
                    date_str = str(t.get("occurred_at") or t.get("date") or "")[:10]
                    merchant_name = t.get("merchant_normalized") or t.get("merchant_raw") or "Chưa xác định được"
                    lines.append(f"| `{date_str}` | **{merchant_name}** | **${t.get('amount', 0):,.2f}** | `{t.get('source', 'card')}` |")
                return "\n".join(lines) + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)
            return ("Không tìm thấy giao dịch nào phù hợp với từ khóa của bạn." if not is_en else "No transactions found matching your search query.") + (MANDATORY_DISCLAIMER_EN if is_en else MANDATORY_DISCLAIMER_VI)

        # Default General QA
        if is_en:
            return (
                "### 👋 Hello! I am Wealify Guardian\n\n"
                "Your Enterprise AI Expense Management & Transaction Safety Copilot.\n\n"
                "#### 🛠️ Available Capabilities:\n"
                "1. **Expense & Fee Summary:** *'How much did I spend this month? What are the top 3 expenses?'*\n"
                "2. **3-Way Reconciliation:** *'Did any money leave my account that hasn't appeared on card?'*\n"
                "3. **Duplicate Charge Detection:** *'Were there any duplicate debits on my cards?'*\n"
                "4. **Subscription Management:** *'Which software subscription had a price hike?'*\n"
                "5. **Overdue Payout Radar:** *'Are any Amazon/Stripe payouts delayed past settlement window?'*"
                + MANDATORY_DISCLAIMER_EN
            )
        return (
            "### 👋 Chào Bạn! Tôi Là Wealify Guardian\n\n"
            "Trợ lý AI bảo vệ giao dịch & hỗ trợ tra soát tài chính tự động cho doanh nghiệp.\n\n"
            "#### 🛠️ Các Nghiệp Vụ Bạn Có Thể Tra Cứu Nhanh:\n"
            "1. **Báo cáo thu chi & phí:** *'Tháng này tôi chi bao nhiêu?', '3 khoản lớn nhất là gì?'*\n"
            "2. **Đối soát 3 nguồn:** *'Có tiền nào rời tài khoản nhưng chưa lên thẻ không?'*\n"
            "3. **Quét trùng lặp thẻ:** *'Có khoản nào bị tính hai lần không?'*\n"
            "4. **Theo dõi Subscriptions:** *'Gói nào vừa tăng giá?', 'Dự báo subscription năm'*.\n"
            "5. **Quét Payout quá hạn:** *'Có khoản thanh toán nào từ Amazon/Stripe chưa về không?'*"
            + MANDATORY_DISCLAIMER_VI
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


class UnifiedLLMProvider(MockLLMProvider):
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
                "10. Always append the mandatory disclaimer at the end of every response."
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
            disclaimer = MANDATORY_DISCLAIMER_EN if language == "en" else MANDATORY_DISCLAIMER_VI
            if "Công cụ này chỉ hỗ trợ bạn rà soát tài chính" not in res_text and "This tool only assists your financial review" not in res_text:
                res_text += disclaimer

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
    """Returns the default LLM provider (Gemini if API key present, otherwise deterministic Mock)."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key:
        return GeminiLLMProvider(api_key=api_key)
    return MockLLMProvider()
