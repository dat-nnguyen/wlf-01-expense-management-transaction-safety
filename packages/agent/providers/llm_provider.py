import os
import json
from typing import Any, Dict, List, Optional
from abc import ABC, abstractmethod
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

# Load .env variables
load_dotenv()

from packages.observability.logging import logger


class LLMResponse(BaseModel):
    content: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    model: str = "mock"


class BaseLLMProvider(ABC):
    """Abstract base class for all LLM Providers."""

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        pass


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic Mock LLM Provider synthesizing natural language
    Vietnamese and English financial explanations directly from structured tool results.
    """

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        context = context or {}
        tool_result = context.get("tool_result", {})
        intent = context.get("intent", "GENERAL_QA")

        # 1. Disallowed Mutation
        if intent == "DISALLOWED_MUTATION":
            text = (
                "⚠️ **Chính sách an toàn tài chính (Policy Denied):**\n"
                "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ an toàn tài sản của bạn. "
                "Hệ thống không được phép trực tiếp chuyển tiền, hủy gói dịch vụ hoặc liên hệ ngân hàng thay bạn.\n\n"
                "💡 **Khuyến nghị:** Bạn có thể tự thực hiện thao tác này trực tiếp trên ứng dụng ngân hàng hoặc trang quản lý của nhà cung cấp."
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

            ledger_sym = "✅" if tool_result.get("ledger_match") else "✕"
            wallet_sym = "✅" if tool_result.get("wallet_match") else "✕"
            email_sym = "✅" if tool_result.get("email_match") else "✕"
            ref_sym = "✅" if tool_result.get("reference_match") else "✕"

            text = (
                f"🛡️ **Tôi đã kiểm tra thông tin trong bằng chứng với các nguồn dữ liệu giao dịch đáng tin cậy của Wealify:**\n\n"
                f"📋 **Thông tin yêu cầu xác minh (Claimed Transaction):**\n"
                f"• Số tiền: **${amt:,.2f} USD**\n"
                f"• Trạng thái tuyên bố: **{claimed.get('claimed_status', 'COMPLETED')}**\n"
                f"• Mã tham chiếu: `{ref}`\n"
                f"• Nguồn bằng chứng: **{claimed.get('source_type', 'SCREENSHOT')}**\n\n"
                f"🔍 **Kết quả đối chiếu nguồn dữ liệu tin cậy (Evidence Inconsistency Score: {score}/100):**\n"
                f"• {ledger_sym} **Sổ cái Wealify (Ledger):** {'Đã tìm thấy giao dịch' if tool_result.get('ledger_match') else 'Không tìm thấy giao dịch tương ứng'}\n"
                f"• {wallet_sym} **Biến động số dư ví (Wallet):** {'Khớp biến động số dư' if tool_result.get('wallet_match') else 'Không có biến động số dư tăng tương ứng'}\n"
                f"• {email_sym} **Hộp thư xác thực (Email):** {'Tìm thấy email xác nhận' if tool_result.get('email_match') else 'Không tìm thấy email xác nhận khớp'}\n"
                f"• {ref_sym} **Mã tham chiếu (Reference):** {'Mã hợp lệ trong hệ thống' if tool_result.get('reference_match') else f'Mã {ref} không tồn tại trên hệ thống'}\n\n"
                f"⚠️ **Đánh giá rủi ro ({status_label} — {sec_tag}):**\n"
                f"Chưa tìm thấy giao dịch thực tế tương ứng trong dữ liệu đáng tin cậy. Ảnh chụp màn hình không tự chứng minh rằng tiền đã thực sự được chuyển vào tài khoản của bạn.\n\n"
                f"💡 **Khuyến nghị xử lý an toàn:**\n"
                f"1. Hãy xác minh trực tiếp trong tài khoản Wealify hoặc ứng dụng ngân hàng trước khi giao hàng hoặc thực hiện hành động liên quan.\n"
                f"2. Không chuyển tiền hoặc gửi hàng chỉ dựa trên ảnh chụp màn hình biên lai do đối tác cung cấp."
            )

        # 3. Explain Alert Email
        elif intent == "EXPLAIN_ALERT_EMAIL":
            text = (
                "📧 **Giải Thích Chi Tiết Lý Do Hệ Thống Gửi Email Cảnh Báo:**\n\n"
                "• **Căn cứ gửi mail:** Hệ thống phát hiện email thông báo giải ngân từ **Amazon Seller Central** ($4,250.00 USD) ngày 05/08/2026 với mã đối soát `AMZ-DISB-20260805-9182`.\n"
                "• **Nguyên nhân kích hoạt cảnh báo:** Quy chuẩn xử lý Payout quốc tế thông thường là **2-3 ngày làm việc**. Tuy nhiên đến nay đã **16 ngày** trôi qua mà tài khoản Wealify vẫn chưa ghi nhận số dư này (có nguy cơ thất lạc mạng ngân hàng trung gian hoặc lệnh bị treo).\n"
                "• **Mục đích:** Cảnh báo sớm giúp khách hàng và bộ phận Kế toán / CEO không bị đứt dòng tiền và kịp thời gửi ticket tra soát trước khi quá hạn khiếu nại.\n\n"
                "💡 **Hướng dẫn cho Khách hàng & Support:**\n"
                "1. Kiểm tra lại thông tin số tài khoản nhận (4 số cuối: ...8821).\n"
                "2. Mở tab **Trung Tâm Bất Thường** > **Payouts** và copy **Mẫu Thư Khiếu Nại** gửi bộ phận hỗ trợ Amazon Seller Central để xin mã tham chiếu Bank ARN / MT103."
            )

        # 4. Overdue / Missing Payout Radar
        elif intent == "OVERDUE_PAYOUT_CHECK":
            payouts = tool_result.get("overdue_payouts", [])
            if payouts:
                lines = [f"🚨 **Phát hiện {len(payouts)} khoản Payout từ Sàn E-commerce chưa về tài khoản:**\n"]
                for p in payouts:
                    meta = p.get("metadata", {})
                    elapsed = meta.get("elapsed_days", p.get("days_overdue", 15))
                    ref_str = f" (Mã đối soát: `{meta.get('payout_ref')}`)" if meta.get('payout_ref') else ""
                    lines.append(
                        f"• **{p.get('title')}**{ref_str}:\n"
                        f"  - Số tiền: **${p.get('amount', 0):,.2f} USD**\n"
                        f"  - Thời gian chậm trễ: **{elapsed} ngày** (Trạng thái: **{p.get('status')}**)\n"
                        f"  - Lý do: {p.get('reason')}\n"
                        f"  - 💡 **Hành động đề xuất:** {p.get('action_suggestion', 'Gửi ticket khiếu nại.')}"
                    )
                lines.append("\n📝 *Hệ thống đã tự động gửi email thông báo và tạo sẵn bản thảo email tra soát (Dispute Letter) trong tab Khiếu Nại.*")
                text = "\n".join(lines)
            else:
                text = "✅ **Không có Payout nào bị trễ:** Tất cả các khoản giải ngân từ sàn đối tác (Amazon, Stripe, Shopify...) đều đã về đúng hạn."

        # 5. Business Health & Unit Economics Advisory
        elif intent == "BUSINESS_HEALTH_ADVISORY":
            report = tool_result.get("health_report", {})
            metrics = report.get("metrics", {})
            rating = report.get("rating", "HEALTHY")
            score = report.get("health_score", 85)

            lines = [
                f"📊 **Báo cáo Sức Khỏe Tài Chính & Hiệu Quả Kinh Doanh ({rating} - {score}/100 điểm):**\n",
                f"• **Chi phí Ads thẻ ảo:** ${metrics.get('total_ad_spend', 0):,.2f} USD",
                f"• **Doanh thu Payout thực nhận:** ${metrics.get('total_payout_received', 0):,.2f} USD",
                f"• **Payout đang bị tắc nghẽn:** ${metrics.get('total_payout_pending', 0):,.2f} USD",
                f"• **Ước tính ROAS:** **{metrics.get('roas', 0):.2f}x** | **Lợi nhuận ròng vận hành:** ${metrics.get('net_operating_profit', 0):,.2f} USD\n",
            ]

            insights = report.get("insights", [])
            if insights:
                lines.append("🔎 **Phân tích dòng tiền:**")
                for ins in insights:
                    lines.append(f"- {ins}")

            recs = report.get("action_recommendations", [])
            if recs:
                lines.append("\n💡 **Gợi ý chiến lược:**")
                for r in recs:
                    lines.append(f"- {r}")

            lines.append("\n👉 *Vui lòng xem chi tiết và xác nhận các hành động gợi ý tại tab Human-in-the-Loop Review Queue.*")
            text = "\n".join(lines)

        # 6. Duplicate Check
        elif intent == "DUPLICATE_CHECK":
            dups = tool_result.get("duplicates", [])
            if dups:
                lines = ["🔍 **Kết quả quét giao dịch trùng lặp / Cà 2 lần trên Thẻ ảo & Tài khoản:**\n"]
                for item in dups:
                    lines.append(
                        f"• **{item.get('title', item.get('merchant', 'Giao dịch'))}**:\n"
                        f"  - Số tiền: **${item.get('amount', 0):,.2f} USD**\n"
                        f"  - {item.get('reason')}\n"
                        f"  - Độ tin cậy: **{item.get('confidence_label', 'Mức độ tin cậy cao')}** ({item.get('confidence', 0.95)*100:.0f}%)\n"
                        f"  - Hạn định tra soát ngân hàng: **60 ngày**"
                    )
                lines.append("\n📌 *Lưu ý: Mẫu đơn tra soát đã được gửi về email thông báo và lưu sẵn trong hệ thống để bạn bấm gửi ngân hàng.*")
                text = "\n".join(lines)
            else:
                text = "✅ **Không phát hiện giao dịch trùng lặp:** Tất cả các khoản chi tiêu trên thẻ ảo và tài khoản đều hợp lệ và không có dấu hiệu bị cà 2 lần."

        # 7. Subscriptions Inquiry & Price Hike
        elif intent == "SUBSCRIPTION_INQUIRY":
            subs = tool_result.get("subscriptions", [])
            if subs:
                lines = [f"📊 **Tổng quan {len(subs)} dịch vụ SaaS/Tool định kỳ đang hoạt động:**\n"]
                for s in subs:
                    hike_note = f" *(⚠️ Đã tăng từ ${s.get('previous_amount'):.2f})*" if s.get("price_changed") else ""
                    lines.append(
                        f"• **{s.get('merchant')}**: ${s.get('amount', 0):.2f}/{s.get('cadence', 'tháng')}{hike_note} "
                        f"→ Dự kiến gia hạn: `{s.get('next_billing_estimated', s.get('next_billing', 'N/A'))[:10]}` "
                        f"(Chi phí ước tính/năm: ${s.get('annual_cost', 0):.2f})"
                    )
                text = "\n".join(lines)
            else:
                text = "Hiện tại hệ thống chưa ghi nhận gói đăng ký định kỳ nào đang hoạt động."

        # 8. Reconciliation Check
        elif intent == "RECONCILIATION_CHECK":
            alerts = tool_result.get("discrepancies", [])
            if alerts:
                lines = ["⚠️ **Kết quả đối soát đa nguồn (Account ↔ Wallet ↔ Card ↔ Email):**\n"]
                for a in alerts:
                    lines.append(f"• **{a.get('title')}**: {a.get('reason')} (Trạng thái: **{a.get('status')}**)")
                text = "\n".join(lines)
            else:
                text = "✅ **Đối soát hoàn tất:** Dòng tiền giữa tài khoản ngân hàng, ví điện tử, thẻ tín dụng và email xác nhận hoàn toàn khớp nhau."

        # 9. Monthly Summary
        elif intent == "MONTHLY_SUMMARY":
            summary = tool_result.get("summary", {})
            text = (
                f"📈 **Báo cáo dòng tiền ({summary.get('period', 'Kỳ này')}):**\n"
                f"• **Tổng thu nhập:** ${summary.get('total_income', 0.0):,.2f} USD\n"
                f"• **Tổng chi tiêu:** ${summary.get('total_expense', 0.0):,.2f} USD\n"
                f"• **Dòng tiền ròng (Net Cash Flow):** ${summary.get('net_cashflow', 0.0):,.2f} USD\n"
                f"• **Số lượng giao dịch:** {summary.get('transaction_count', 0)} giao dịch."
            )

        # 10. Specific Transaction Search
        elif intent == "TRANSACTION_SEARCH":
            txs = tool_result.get("transactions", [])
            if txs:
                lines = [f"🔎 **Tìm thấy {len(txs)} giao dịch liên quan:**\n"]
                for t in txs:
                    date_str = str(t.get('occurred_at') or t.get('date') or '')[:10]
                    merchant_name = t.get('merchant_normalized') or t.get('merchant_raw') or t.get('merchant') or 'Giao dịch'
                    lines.append(f"• `{date_str}` | **{merchant_name}**: ${t.get('amount', 0):.2f} USD ({t.get('source', 'card')})")
                text = "\n".join(lines)
            else:
                text = "Không tìm thấy giao dịch nào phù hợp với từ khóa của bạn."

        # Default QA
        else:
            text = (
                "Xin chào! Tôi là **Wealify Guardian**, trợ lý AI bảo vệ giao dịch & hỗ trợ tra soát tài chính cho người dùng và đội Support Wealify. "
                "Tôi có thể giúp bạn: (1) Giải thích lý do tại sao gửi email cảnh báo về hộp thư, (2) Tra soát Payout Amazon/Stripe bị trễ, "
                "(3) Tra cứu thẻ ảo bị trừ tiền 2 lần, (4) Hướng dẫn quy trình gửi khiếu nại ngân hàng và (5) Cố vấn hiệu quả kinh doanh & P&L."
            )

        return LLMResponse(
            content=text,
            prompt_tokens=len(prompt.split()) + 40,
            completion_tokens=len(text.split()),
            model="mock-deterministic",
        )


class UnifiedLLMProvider(BaseLLMProvider):
    """
    All-in-One LLM Provider supporting:
    - OpenRouter (OpenRouter.ai: 200+ models with 1 key)
    - OpenAI (GPT-4o, GPT-4o-mini, o1, o3-mini)
    - Google Gemini (Gemini 1.5 Flash, 1.5 Pro, 2.0 Flash)
    - Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Haiku)
    - Groq (Llama 3.3 70B, DeepSeek R1 Distill)
    - DeepSeek (DeepSeek V3, DeepSeek R1)
    - Ollama (Local offline models)
    - Mock (Deterministic offline fallback)
    """

    def __init__(
        self,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ):
        load_dotenv(override=True)
        self.provider = (provider or os.getenv("LLM_PROVIDER", "openrouter")).lower().strip()
        self.model = model or os.getenv("LLM_MODEL") or self._default_model_for_provider()
        self.api_key = api_key or self._resolve_api_key()
        self.base_url = base_url or self._resolve_base_url()
        self.mock_fallback = MockLLMProvider()

    def _default_model_for_provider(self) -> str:
        defaults = {
            "openrouter": "openai/gpt-4o-mini",
            "openai": "gpt-4o-mini",
            "gemini": "gemini-1.5-flash",
            "google": "gemini-1.5-flash",
            "claude": "claude-3-5-sonnet-20241022",
            "anthropic": "claude-3-5-sonnet-20241022",
            "groq": "llama-3.3-70b-versatile",
            "deepseek": "deepseek-chat",
            "ollama": "llama3",
            "mock": "mock-guardian",
        }
        return defaults.get(self.provider, "openai/gpt-4o-mini")

    def _resolve_api_key(self) -> str:
        if self.provider == "openrouter":
            return os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
        elif self.provider in ["openai"]:
            return os.getenv("OPENAI_API_KEY") or ""
        elif self.provider in ["gemini", "google"]:
            return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
        elif self.provider in ["claude", "anthropic"]:
            return os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY") or ""
        elif self.provider == "groq":
            return os.getenv("GROQ_API_KEY") or ""
        elif self.provider == "deepseek":
            return os.getenv("DEEPSEEK_API_KEY") or ""
        return ""

    def _resolve_base_url(self) -> str:
        if self.provider == "openrouter":
            return (os.getenv("OPENROUTER_BASE_URL") or "https://openrouter.ai/api/v1").rstrip("/")
        elif self.provider == "openai":
            return (os.getenv("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
        elif self.provider == "groq":
            return "https://api.groq.com/openai/v1"
        elif self.provider == "deepseek":
            return "https://api.deepseek.com/v1"
        elif self.provider in ["ollama", "local"]:
            return (os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").rstrip("/")
        return ""

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> LLMResponse:
        # If disallowed mutation, return standard compliant policy response
        if context and context.get("intent") == "DISALLOWED_MUTATION":
            return await self.mock_fallback.generate(prompt, system_prompt, context)

        # If mock mode or missing API key, use safe mock generator
        if self.provider == "mock" or (not self.api_key and self.provider not in ["ollama", "local"]):
            if self.provider != "mock" and not self.api_key:
                logger.warning(f"No API key provided for '{self.provider}'. Falling back to deterministic Mock provider.")
            return await self.mock_fallback.generate(prompt, system_prompt, context)

        # Build Financial Safety System Prompt
        sys_prompt = system_prompt or (
            "Bạn là Wealify Guardian — AI Expense Management & Transaction Safety Copilot bảo vệ người dùng và doanh nghiệp. "
            "Quy tắc bất biến: 'LLM diễn giải & tổng hợp. Financial Engine tính toán. Bằng chứng chứng minh. Con người quyết định.'\n"
            "- Không tự sáng tác số liệu tài chính, luôn đối chiếu và bám sát dữ liệu thực tế (Ground Truth Evidence) được cung cấp.\n"
            "- Chỉ sử dụng 3 trạng thái phân loại chuẩn: 'Định kỳ đã xác định', 'Cần bạn tự xác nhận', 'Chưa đủ dữ liệu'.\n"
            "- Không khẳng định chắc chắn 100% gian lận mà nhấn mạnh mâu thuẫn bằng chứng.\n"
            "- Nhắc nhở thời hạn tra soát khiếu nại giao dịch là 60 ngày kể từ ngày ngân hàng gửi sao kê.\n"
            "- Hoạt động ở chế độ Read-Only an toàn, hướng dẫn người dùng tự thao tác với ngân hàng."
        )

        # Inject Ground Truth Tool Evidence into User Prompt
        user_prompt = prompt
        if context:
            tool_data = context.get("tool_result")
            intent = context.get("intent")
            if tool_data:
                user_prompt += f"\n\n[Dữ liệu đối soát thực tế từ Financial Engine (Intent: {intent})]:\n{json.dumps(tool_data, ensure_ascii=False, indent=2)}"

        try:
            # 1. OpenRouter / OpenAI / Groq / DeepSeek (OpenAI-compatible chat completions)
            if self.provider in ["openrouter", "openai", "groq", "deepseek"]:
                return await self._call_openai_compatible(user_prompt, sys_prompt)

            # 2. Google Gemini
            elif self.provider in ["gemini", "google"]:
                return await self._call_gemini(user_prompt, sys_prompt)

            # 3. Anthropic Claude
            elif self.provider in ["claude", "anthropic"]:
                return await self._call_claude(user_prompt, sys_prompt)

            # 4. Local Ollama
            elif self.provider in ["ollama", "local"]:
                return await self._call_ollama(user_prompt, sys_prompt)

        except Exception as e:
            logger.error(f"Error calling live LLM {self.provider} ({self.model}): {e}. Falling back to mock synthesis.")
            return await self.mock_fallback.generate(prompt, system_prompt, context)

        return await self.mock_fallback.generate(prompt, system_prompt, context)

    async def _call_openai_compatible(self, prompt: str, system_prompt: Optional[str]) -> LLMResponse:
        messages: List[Dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        # Extra headers for OpenRouter rankings & app attribution
        if self.provider == "openrouter":
            headers["HTTP-Referer"] = "https://wealify.io"
            headers["X-Title"] = "Wealify Guardian Transaction Safety"

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()

            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            return LLMResponse(
                content=content,
                prompt_tokens=usage.get("prompt_tokens", 0),
                completion_tokens=usage.get("completion_tokens", 0),
                model=self.model,
            )

    async def _call_gemini(self, prompt: str, system_prompt: Optional[str]) -> LLMResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        contents: List[Dict[str, Any]] = []

        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Instruction: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will act strictly as Wealify Guardian financial assistant."}]})

        contents.append({"role": "user", "parts": [{"text": prompt}]})
        payload = {
            "contents": contents,
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024}
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post(url, json=payload)
            res.raise_for_status()
            data = res.json()

            candidates = data.get("candidates", [])
            if not candidates:
                return LLMResponse(content="Không có phản hồi từ Gemini API.", model=self.model)

            text_parts = candidates[0].get("content", {}).get("parts", [])
            content = "".join([p.get("text", "") for p in text_parts])
            usage = data.get("usageMetadata", {})

            return LLMResponse(
                content=content,
                prompt_tokens=usage.get("promptTokenCount", 0),
                completion_tokens=usage.get("candidatesTokenCount", 0),
                model=self.model,
            )

    async def _call_claude(self, prompt: str, system_prompt: Optional[str]) -> LLMResponse:
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload: Dict[str, Any] = {
            "model": self.model,
            "max_tokens": 1024,
            "temperature": 0.2,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=45.0) as client:
            res = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()

            content_blocks = data.get("content", [])
            content = "".join([b.get("text", "") for b in content_blocks if b.get("type") == "text"])
            usage = data.get("usage", {})

            return LLMResponse(
                content=content,
                prompt_tokens=usage.get("input_tokens", 0),
                completion_tokens=usage.get("output_tokens", 0),
                model=self.model,
            )

    async def _call_ollama(self, prompt: str, system_prompt: Optional[str]) -> LLMResponse:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt or "You are Wealify Guardian financial assistant.",
            "stream": False,
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(f"{self.base_url}/api/generate", json=payload)
            res.raise_for_status()
            data = res.json()

            return LLMResponse(
                content=data.get("response", ""),
                prompt_tokens=data.get("prompt_eval_count", 0),
                completion_tokens=data.get("eval_count", 0),
                model=self.model,
            )


def get_llm_provider() -> BaseLLMProvider:
    """Factory creating the configured UnifiedLLMProvider."""
    return UnifiedLLMProvider()
