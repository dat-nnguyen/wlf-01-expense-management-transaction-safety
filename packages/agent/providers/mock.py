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

        # 1. Disallowed Mutation
        if intent == "DISALLOWED_MUTATION":
            text = (
                "⚠️ **Chính sách an toàn tài chính (Policy Denied):**\n"
                "Wealify Guardian hoạt động ở chế độ **Read-Only** nhằm bảo vệ an toàn tài sản của bạn. "
                "Hệ thống không được phép trực tiếp chuyển tiền, hủy gói dịch vụ hoặc liên hệ ngân hàng thay bạn.\n\n"
                "💡 **Khuyến nghị:** Bạn có thể tự thực hiện thao tác này trực tiếp trên ứng dụng ngân hàng hoặc trang quản lý của nhà cung cấp."
            )

        # 2. Overdue / Missing Payout Radar
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
                lines.append("\n📝 *Hệ thống đã tự động tạo sẵn bản thảo email tra soát (Dispute Letter) để bạn gửi cho sàn trong tab Khiếu Nại.*")
                text = "\n".join(lines)
            else:
                text = "✅ **Không có Payout nào bị trễ:** Tất cả các khoản giải ngân từ sàn đối tác (Amazon, Stripe, Shopify...) đều đã về đúng hạn."

        # 3. Business Health & Unit Economics Advisory
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

        # 4. Duplicate Check
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
                lines.append("\n📌 *Lưu ý: Mẫu đơn tra soát đã được tạo sẵn trong hệ thống để bạn bấm xác nhận gửi ngân hàng.*")
                text = "\n".join(lines)
            else:
                text = "✅ **Không phát hiện giao dịch trùng lặp:** Tất cả các khoản chi tiêu trên thẻ ảo và tài khoản đều hợp lệ và không có dấu hiệu bị cà 2 lần."

        # 5. Subscriptions Inquiry & Price Hike
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

        # 6. Reconciliation Check
        elif intent == "RECONCILIATION_CHECK":
            alerts = tool_result.get("discrepancies", [])
            if alerts:
                lines = ["⚠️ **Kết quả đối soát đa nguồn (Account ↔ Wallet ↔ Card ↔ Email):**\n"]
                for a in alerts:
                    lines.append(f"• **{a.get('title')}**: {a.get('reason')} (Trạng thái: **{a.get('status')}**)")
                text = "\n".join(lines)
            else:
                text = "✅ **Đối soát hoàn tất:** Dòng tiền giữa tài khoản ngân hàng, ví điện tử, thẻ tín dụng và email xác nhận hoàn toàn khớp nhau."

        # 7. Monthly Summary
        elif intent == "MONTHLY_SUMMARY":
            summary = tool_result.get("summary", {})
            text = (
                f"📈 **Báo cáo dòng tiền ({summary.get('period', 'Kỳ này')}):**\n"
                f"• **Tổng thu nhập:** ${summary.get('total_income', 0.0):,.2f} USD\n"
                f"• **Tổng chi tiêu:** ${summary.get('total_expense', 0.0):,.2f} USD\n"
                f"• **Dòng tiền ròng (Net Cash Flow):** ${summary.get('net_cashflow', 0.0):,.2f} USD\n"
                f"• **Số lượng giao dịch:** {summary.get('transaction_count', 0)} giao dịch."
            )

        # 8. Specific Transaction Search
        elif intent == "TRANSACTION_SEARCH":
            txs = tool_result.get("transactions", [])
            if txs:
                lines = [f"🔎 **Tìm thấy {len(txs)} giao dịch liên quan:**\n"]
                for t in txs:
                    lines.append(f"• `{t.get('date')}` | **{t.get('merchant')}**: ${t.get('amount', 0):.2f} ({t.get('source')})")
                text = "\n".join(lines)
            else:
                text = "Không tìm thấy giao dịch nào phù hợp với từ khóa của bạn."

        # Default QA
        else:
            text = (
                "Xin chào! Tôi là **Wealify Guardian**, trợ lý AI bảo vệ giao dịch & quản trị dòng tiền doanh nghiệp. "
                "Tôi có thể giúp bạn: (1) Rà soát Payouts bị trễ từ Amazon/Stripe, (2) Phát hiện quẹt thẻ ảo 2 lần, "
                "(3) Cảnh báo tool SaaS tăng giá, (4) Đối soát dòng tiền đa nguồn, và (5) Cố vấn hiệu quả kinh doanh & P&L."
            )

        return LLMResponse(
            content=text,
            prompt_tokens=len(prompt.split()) + 40,
            completion_tokens=len(text.split()),
            model="mock-deterministic",
        )
