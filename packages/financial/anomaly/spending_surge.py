"""Spending Surge & Category Spike Detection Engine for Wealify Guardian.

Compares current spending window (e.g. weekly/monthly) against historical baseline,
calculates category-wise attribution breakdowns, and explains root cause anomalies.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionType


class CategoryAttribution(BaseModel):
    category: str
    current_amount: float
    baseline_amount: float
    delta_amount: float
    percentage_growth: float
    attribution_share_pct: float  # Share of the total spending surge contributed by this category
    top_drivers: List[str] = Field(default_factory=list)


class SpendingSurgeReport(BaseModel):
    account_id: str
    is_surge: bool
    time_window: str  # "weekly" or "monthly"
    current_period_spend: float
    historical_baseline_spend: float
    surge_multiplier: float  # e.g. 5.25x (525%)
    surge_percentage: float  # e.g. +425%
    primary_surge_category: str
    category_breakdowns: List[CategoryAttribution]
    explanation_vi: str
    explanation_en: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SpendingSurgeRadar:
    """
    Analyzes multi-week / multi-month transaction history,
    computes rolling average baselines, identifies abnormal spikes,
    and attributes the surge to specific categories and merchants.
    """

    @staticmethod
    def _categorize(tx: Transaction) -> str:
        merchant = (tx.merchant_normalized or tx.merchant_raw or "").lower()
        if tx.transaction_type == TransactionType.AD_SPEND or any(k in merchant for k in ["facebook", "meta", "google *ads", "tiktok", "facebk", "ads"]):
            return "Digital Ads & Marketing"
        elif tx.transaction_type == TransactionType.SUBSCRIPTION or any(k in merchant for k in ["netflix", "openai", "chatgpt", "paddle", "github", "spotify", "notion", "subscription"]):
            return "SaaS & Subscriptions"
        elif any(k in merchant for k in ["aws", "amazon web services", "cloud", "digitalocean", "cloudflare"]):
            return "Cloud & Infrastructure"
        elif tx.transaction_type == TransactionType.FEE or any(k in merchant for k in ["fee", "wire", "transfer fee"]):
            return "Banking & FX Fees"
        else:
            return "Operations & Other Expenses"

    @classmethod
    def detect_surges(
        cls,
        transactions: List[Transaction],
        account_id: str = "acc_main",
        window_days: int = 7,
        threshold_growth_pct: float = 50.0,
    ) -> SpendingSurgeReport:
        now = datetime.now(timezone.utc)
        current_cutoff = now - timedelta(days=window_days)
        historical_cutoff = now - timedelta(days=window_days * 4)  # 3 prior periods for baseline

        def _to_tz(dt: datetime) -> datetime:
            return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)

        # Only evaluate actual expenses/spend (exclude internal asset transfers to own bank accounts)
        expense_txs = [
            tx for tx in transactions
            if tx.direction == TransactionDirection.DEBIT
            and tx.transaction_type not in [TransactionType.TRANSFER_TO_CARD, TransactionType.TRANSFER]
            and "withdrawal" not in (tx.merchant_raw or "").lower()
            and "rút về" not in (tx.merchant_raw or "").lower()
            and _to_tz(tx.occurred_at) >= historical_cutoff
        ]

        current_txs = [tx for tx in expense_txs if _to_tz(tx.occurred_at) >= current_cutoff]
        historical_txs = [tx for tx in expense_txs if _to_tz(tx.occurred_at) < current_cutoff]

        current_total = sum(tx.amount for tx in current_txs)
        
        # Historical baseline calculation (average per window_days)
        num_prior_periods = 3.0
        hist_total = sum(tx.amount for tx in historical_txs)
        baseline_total = (hist_total / num_prior_periods) if hist_total > 0 else 200.0

        delta_total = current_total - baseline_total
        growth_pct = (delta_total / baseline_total * 100.0) if baseline_total > 0 else 0.0
        is_surge = growth_pct >= threshold_growth_pct and delta_total > 50.0

        # Category-wise Breakdown & Attribution
        categories = [
            "Digital Ads & Marketing",
            "SaaS & Subscriptions",
            "Cloud & Infrastructure",
            "Banking & FX Fees",
            "Operations & Other Expenses",
        ]

        breakdowns: List[CategoryAttribution] = []
        for cat in categories:
            curr_cat_txs = [tx for tx in current_txs if cls._categorize(tx) == cat]
            hist_cat_txs = [tx for tx in historical_txs if cls._categorize(tx) == cat]

            curr_cat_amt = sum(tx.amount for tx in curr_cat_txs)
            hist_cat_amt = sum(tx.amount for tx in hist_cat_txs) / num_prior_periods
            cat_delta = curr_cat_amt - hist_cat_amt
            cat_growth = (cat_delta / hist_cat_amt * 100.0) if hist_cat_amt > 0 else (100.0 if curr_cat_amt > 0 else 0.0)
            
            # Share of overall surge
            share_pct = (cat_delta / delta_total * 100.0) if delta_total > 0 and cat_delta > 0 else 0.0

            # Top drivers in this category
            top_drivers = [f"{tx.merchant_normalized or tx.merchant_raw} (${tx.amount:,.2f})" for tx in sorted(curr_cat_txs, key=lambda x: x.amount, reverse=True)[:2]]

            breakdowns.append(CategoryAttribution(
                category=cat,
                current_amount=curr_cat_amt,
                baseline_amount=hist_cat_amt,
                delta_amount=cat_delta,
                percentage_growth=cat_growth,
                attribution_share_pct=share_pct,
                top_drivers=top_drivers,
            ))

        # Sort breakdowns by attribution share descending
        breakdowns.sort(key=lambda x: x.attribution_share_pct, reverse=True)
        primary_category = breakdowns[0].category if breakdowns else "General"

        # Generate Natural Language Explanations
        multiplier = (current_total / baseline_total) if baseline_total > 0 else 1.0

        if is_surge:
            top_cat1 = breakdowns[0]
            top_cat2 = breakdowns[1] if len(breakdowns) > 1 and breakdowns[1].attribution_share_pct > 10 else None
            
            cat_desc_vi = f"**{top_cat1.category}** (tăng ${top_cat1.delta_amount:,.2f} USD, chiếm {top_cat1.attribution_share_pct:.0f}% mức tăng)"
            if top_cat2:
                cat_desc_vi += f" và **{top_cat2.category}** (tăng ${top_cat2.delta_amount:,.2f} USD, chiếm {top_cat2.attribution_share_pct:.0f}% mức tăng)"

            explanation_vi = (
                f"📈 **Cảnh báo Chi tiêu Đột biến Tuần này:**\n\n"
                f"• Tổng chi tiêu 7 ngày qua: **${current_total:,.2f} USD** (Tăng **+{growth_pct:.0f}%**, gấp **{multiplier:.1f} lần** so với mức trung bình các tuần trước là **${baseline_total:,.2f} USD**).\n"
                f"• **Nguyên nhân chính:** Mức tăng đột biến này chủ yếu xuất phát từ {cat_desc_vi}.\n"
                f"• **Các giao dịch đóng góp lớn nhất:**\n"
            )
            for b in breakdowns[:2]:
                if b.top_drivers:
                    explanation_vi += f"  - *{b.category}:* {', '.join(b.top_drivers)}\n"

            explanation_en = (
                f"📈 **Spending Surge Detected for Current Period:**\n\n"
                f"• Total spend in the past 7 days: **${current_total:,.2f} USD** (+{growth_pct:.0f}% growth, **{multiplier:.1f}x** higher than the 3-week baseline of **${baseline_total:,.2f} USD**).\n"
                f"• **Primary Root Cause:** The surge is primarily driven by **{top_cat1.category}** (+${top_cat1.delta_amount:,.2f} USD, {top_cat1.attribution_share_pct:.0f}% of total surge).\n"
                f"• **Top Transaction Drivers:**\n"
            )
            for b in breakdowns[:2]:
                if b.top_drivers:
                    explanation_en += f"  - *{b.category}:* {', '.join(b.top_drivers)}\n"
        else:
            explanation_vi = (
                f"✅ **Chi tiêu ổn định trong định mức:** Tổng chi tiêu tuần này là **${current_total:,.2f} USD**, "
                f"không có biến động đột biến so với mức trung bình lịch sử (${baseline_total:,.2f} USD)."
            )
            explanation_en = (
                f"✅ **Spending is within normal range:** Total spend this period is **${current_total:,.2f} USD**, "
                f"consistent with historical baseline (${baseline_total:,.2f} USD)."
            )

        return SpendingSurgeReport(
            account_id=account_id,
            is_surge=is_surge,
            time_window=f"Last {window_days} Days vs Historical Baseline",
            current_period_spend=current_total,
            historical_baseline_spend=baseline_total,
            surge_multiplier=multiplier,
            surge_percentage=growth_pct,
            primary_surge_category=primary_category,
            category_breakdowns=breakdowns,
            explanation_vi=explanation_vi,
            explanation_en=explanation_en,
        )


spending_surge_radar = SpendingSurgeRadar()
