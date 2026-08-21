import uuid
from datetime import datetime
from typing import List, Optional
from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionType
from packages.data.schemas.email import EmailEvidence
from packages.data.schemas.alert import Alert, AlertType
from packages.data.schemas.advisory import (
    BusinessHealthReport,
    HealthRating,
    HITLActionItem,
    HITLActionStatus,
    UnitEconomicsMetrics,
)


class BusinessAdvisor:
    """
    Financial Health & Business Unit Economics Advisor:
    Evaluates business performance by analyzing Ad Spend on Virtual Cards vs E-commerce Payouts,
    detects cashflow squeeze / negative unit economics, and provides Human-in-the-Loop decision recommendations.
    """

    @staticmethod
    def analyze_health(
        account_id: str,
        transactions: List[Transaction],
        payout_alerts: Optional[List[Alert]] = None,
    ) -> BusinessHealthReport:
        payout_alerts = payout_alerts or []

        # 1. Aggregate Ad Spend
        ad_txs = [
            tx for tx in transactions
            if tx.transaction_type == TransactionType.AD_SPEND
            or any(k in (tx.merchant_normalized or tx.merchant_raw).lower() for k in ["facebook", "google", "meta ads", "tiktok ads"])
        ]
        total_ad_spend = sum(tx.amount for tx in ad_txs)

        # 2. Aggregate Payouts Received
        payout_received_txs = [
            tx for tx in transactions
            if tx.direction == TransactionDirection.CREDIT
            and ("payout" in tx.tags or "payout" in (tx.merchant_normalized or tx.merchant_raw).lower() or "stripe" in (tx.merchant_normalized or tx.merchant_raw).lower())
        ]
        total_payout_received = sum(tx.amount for tx in payout_received_txs)

        # 3. Aggregate Pending Overdue Payouts
        total_payout_pending = sum(a.amount or 0.0 for a in payout_alerts if a.alert_type == AlertType.OVERDUE_PAYOUT)

        # 4. Aggregate Subscriptions
        sub_txs = [
            tx for tx in transactions
            if tx.transaction_type == TransactionType.SUBSCRIPTION
            or "subscription" in tx.tags
        ]
        total_subs = sum(tx.amount for tx in sub_txs)

        # 5. Total Income & Total Expense
        total_income = sum(tx.amount for tx in transactions if tx.direction == TransactionDirection.CREDIT)
        total_expense = sum(tx.amount for tx in transactions if tx.direction == TransactionDirection.DEBIT)
        net_profit = total_income - total_expense

        # ROAS = (Payout Received + Payout Pending) / Ad Spend (if ad spend > 0)
        estimated_gross_revenue = total_payout_received + total_payout_pending
        roas = round(estimated_gross_revenue / total_ad_spend, 2) if total_ad_spend > 0 else 0.0

        # Burn rate daily (based on last 30 days)
        burn_rate_daily = round(total_expense / 30.0, 2)
        current_liquidity = total_income - total_expense
        estimated_runway_days = int(max(0, current_liquidity / max(1.0, burn_rate_daily)))

        # Determine Health Rating & Insights
        insights: List[str] = []
        recommendations: List[str] = []
        hitl_actions: List[HITLActionItem] = []

        rating = HealthRating.HEALTHY
        health_score = 85

        # Factor A: Delayed Payout Cashflow Squeeze
        if total_payout_pending > 2000.0:
            health_score -= 25
            rating = HealthRating.WARNING
            insights.append(
                f"🚨 **Áp lực dòng tiền tắc nghẽn:** Đang có ${total_payout_pending:,.2f} USD tiền Payout từ sàn E-commerce bị trễ chưa về tài khoản Wealify."
            )
            recommendations.append(
                "Ưu tiên gửi ticket tra soát giải ngân ngay để tránh gián đoạn nguồn vốn lưu động."
            )
            hitl_actions.append(
                HITLActionItem(
                    id=f"hitl_payout_{uuid.uuid4().hex[:6]}",
                    title="Gửi thư tra soát tự động tới Sàn E-commerce",
                    description=f"Gửi bản thảo tra soát cho khoản giải ngân ${total_payout_pending:,.2f} USD đang bị chậm trễ.",
                    action_type="draft_payout_ticket",
                    payload={"pending_amount": total_payout_pending},
                    status=HITLActionStatus.PENDING,
                )
            )

        # Factor B: Ad Spend vs Payout Margin
        if total_ad_spend > 0:
            ad_to_revenue_ratio = total_ad_spend / max(1.0, total_payout_received)
            if ad_to_revenue_ratio > 0.60:
                health_score -= 20
                if rating == HealthRating.HEALTHY:
                    rating = HealthRating.WARNING
                insights.append(
                    f"⚠️ **Tỷ trọng chi phí Ads cao ({ad_to_revenue_ratio*100:.1f}% doanh thu thực nhận):** "
                    f"Chi phí Ads (${total_ad_spend:,.2f}) đang ăn mòn biên lợi nhuận ròng."
                )
                recommendations.append(
                    "Tối ưu lại các nhóm quảng cáo có ROAS thấp trên Facebook/Google Ads để bảo vệ dòng tiền."
                )
                top_ad = max(ad_txs, key=lambda x: x.amount) if ad_txs else None
                campaign_desc = (top_ad.merchant_normalized or top_ad.merchant_raw) if top_ad else "Facebook Ads"
                campaign_ref = (top_ad.source_reference or top_ad.id) if top_ad else "84918239"

                hitl_actions.append(
                    HITLActionItem(
                        id=f"hitl_ad_{uuid.uuid4().hex[:6]}",
                        title=f"Đề xuất: Tối ưu ngân sách chiến dịch {campaign_desc} (#{campaign_ref})",
                        description=f"Tạm giảm 30% ngân sách chiến dịch {campaign_desc} (${top_ad.amount if top_ad else total_ad_spend:,.2f}) để cân bằng dòng tiền.",
                        action_type="pause_ad_campaign",
                        payload={"campaign_id": campaign_ref, "merchant": campaign_desc, "reduction": 0.30},
                        status=HITLActionStatus.PENDING,
                    )
                )

        if net_profit < 0:
            health_score -= 20
            rating = HealthRating.CRITICAL_RISK
            insights.append(
                f"❌ **Dòng tiền âm trong kỳ:** Chi tiêu thực tế (${total_expense:,.2f}) vượt quá thu nhập thực nhận (${total_income:,.2f})."
            )

        health_score = max(10, min(100, health_score))

        metrics = UnitEconomicsMetrics(
            total_ad_spend=round(total_ad_spend, 2),
            total_payout_received=round(total_payout_received, 2),
            total_payout_pending=round(total_payout_pending, 2),
            total_subscriptions=round(total_subs, 2),
            net_operating_profit=round(net_profit, 2),
            roas=roas,
            payout_lag_days_avg=15.0 if total_payout_pending > 0 else 2.0,
            burn_rate_daily=burn_rate_daily,
            estimated_runway_days=estimated_runway_days,
        )

        summary = (
            f"Sức khỏe tài chính đạt mức **{rating.value} ({health_score}/100 điểm)**. "
            f"Tổng chi tiêu quảng cáo ${total_ad_spend:,.2f} USD mang lại ước tính ROAS {roas}x. "
            f"Cần lưu ý kiểm soát ${total_payout_pending:,.2f} USD Payout đang chờ xử lý."
        )

        return BusinessHealthReport(
            account_id=account_id,
            rating=rating,
            health_score=health_score,
            summary=summary,
            metrics=metrics,
            insights=insights,
            action_recommendations=recommendations,
            hitl_actions=hitl_actions,
            created_at=datetime.utcnow(),
        )
