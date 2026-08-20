import json
from typing import Any, Dict, Optional
from packages.agent.providers.base import BaseLLMProvider, LLMResponse


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic Mock LLM Provider that synthesizes clear natural language
    Vietnamese and English financial explanations directly from structured tool results and evidence.
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
        user_msg = prompt.lower()

        # Generate intelligent natural language response based on facts
        if intent == "DISALLOWED_MUTATION":
            text = (
                "⚠️ **Chính sách an toàn tài chính (Policy Denied):**\n"
                "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ an toàn tài sản của bạn. "
                "Hệ thống không được phép trực tiếp chuyển tiền, hủy gói dịch vụ hoặc liên hệ ngân hàng thay bạn.\n\n"
                "💡 **Khuyến nghị:** Bạn có thể tự thực hiện thao tác này trực tiếp trên ứng dụng ngân hàng hoặc trang quản lý của nhà cung cấp."
            )
        elif intent == "DUPLICATE_CHECK":
            dups = tool_result.get("duplicates", [])
            if dups:
                lines = ["🔍 **Kết quả quét giao dịch trùng lặp:**\n"]
                for item in dups:
                    lines.append(
                        f"- **{item.get('merchant', 'Giao dịch')}**: Phát hiện 2 lần trừ ${item.get('amount', 0):.2f}. "
                        f"Trạng thái: **{item.get('status', 'Cần bạn tự xác nhận')}** "
                        f"(Độ tin cậy: {item.get('confidence_label', 'Mức độ tin cậy cao')})."
                    )
                lines.append("\n📌 *Lưu ý: Bạn có thời hạn tối đa 60 ngày để gửi yêu cầu tra soát nếu có sai sót.*")
                text = "\n".join(lines)
            else:
                text = "✅ **Không phát hiện giao dịch trùng lặp:** Tất cả các khoản chi tiêu trong kỳ đều hợp lệ và không có dấu hiệu bị trừ tiền hai lần."

        elif intent == "SUBSCRIPTION_INQUIRY":
            subs = tool_result.get("subscriptions", [])
            if subs:
                lines = [f"📊 **Tổng quan {len(subs)} dịch vụ định kỳ đang hoạt động:**\n"]
                for s in subs:
                    hike_note = f" *(⚠️ Đã tăng từ ${s.get('previous_amount'):.2f})*" if s.get("price_changed") else ""
                    lines.append(
                        f"- **{s.get('merchant')}**: ${s.get('amount'):.2f}/{s.get('cadence', 'tháng')}{hike_note} "
                        f"→ Dự kiến gia hạn: `{s.get('next_billing')}` (Chi phí ước tính/năm: ${s.get('annual_cost'):.2f})"
                    )
                text = "\n".join(lines)
            else:
                text = "Hiện tại hệ thống chưa ghi nhận gói đăng ký định kỳ nào đang hoạt động."

        elif intent == "RECONCILIATION_CHECK":
            alerts = tool_result.get("discrepancies", [])
            if alerts:
                lines = ["⚠️ **Kết quả đối soát đa nguồn (Account ↔ Wallet ↔ Card):**\n"]
                for a in alerts:
                    lines.append(f"- **{a.get('title')}**: {a.get('reason')} (Trạng thái: **{a.get('status')}**)")
                text = "\n".join(lines)
            else:
                text = "✅ **Đối soát hoàn tất:** Dòng tiền giữa tài khoản ngân hàng, ví điện tử và thẻ tín dụng hoàn toàn khớp nhau."

        elif intent == "MONTHLY_SUMMARY":
            summary = tool_result.get("summary", {})
            text = (
                f"📈 **Báo cáo dòng tiền ({summary.get('period', 'Kỳ này')}):**\n"
                f"- **Tổng chi tiêu:** ${summary.get('total_expense', 0.0):.2f}\n"
                f"- **Tổng thu nhập:** ${summary.get('total_income', 0.0):.2f}\n"
                f"- **Dòng tiền ròng (Net):** ${summary.get('net_cashflow', 0.0):.2f}\n"
                f"- **Số lượng giao dịch:** {summary.get('transaction_count', 0)} giao dịch."
            )
        elif intent == "TRANSACTION_SEARCH":
            txs = tool_result.get("transactions", [])
            if txs:
                lines = [f"🔎 **Tìm thấy {len(txs)} giao dịch liên quan:**\n"]
                for t in txs:
                    lines.append(f"- `{t.get('date')}` | **{t.get('merchant')}**: ${t.get('amount'):.2f} ({t.get('source')})")
                text = "\n".join(lines)
            else:
                text = "Không tìm thấy giao dịch nào phù hợp với từ khóa của bạn."
        else:
            text = (
                "Xin chào! Tôi là **Wealify Guardian**, trợ lý an toàn giao dịch & đối soát tài chính của bạn. "
                "Tôi có thể giúp bạn kiểm tra chi tiêu, rà soát trùng lặp, phát hiện tăng giá subscription và đối soát dòng tiền đa nguồn."
            )

        return LLMResponse(
            content=text,
            prompt_tokens=len(prompt.split()) + 40,
            completion_tokens=len(text.split()),
            model="mock-deterministic",
        )
