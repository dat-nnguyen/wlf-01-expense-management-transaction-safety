"""Wealify Real-World Canonical Dataset.

Accurately models the real Wealify Dashboard structure (from live production screenshots):
- User Profile: Lê Minh Anh (Director)
- Virtual Cards (/vc): Volcano Ads (**** 0001) - Balance: $1,822.96 USD
- Virtual Accounts (/va/list): Etsy, Payoneer, Paypal, PingPong, Amazon, Stripe (BIDV, MSB)
- Wallet (/va): 274,436,000 VND / $2,750.01 USD
- Timeline Transactions: 
  * Duplicate Card Top-up ($250.00 x 2 within 11 mins)
  * SaaS Subscriptions & Price Hike (Paddle.net $10 -> $25, Netflix $9.99)
  * Overdue Payouts (Amazon $4,250.00 overdue 16 days, PingPong $162,236,000 VND pending)
  * Spending Surge: Weekly baseline ($200) vs this week ($1,050.00, +425% spike from Meta Ads & AWS)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any

from packages.data.schemas.transaction import (
    Transaction,
    TransactionDirection,
    TransactionSource,
    TransactionType,
)

# Reference Base Time
NOW = datetime.utcnow()

# ==============================================================================
# 1. WALLET & VIRTUAL CARD MASTER RECORDS
# ==============================================================================

REAL_WALLET_SUMMARY = {
    "account_id": "acc_main",
    "user_name": "Lê Minh Anh",
    "role": "Director",
    "total_balance_usd": 4572.97,
    "wallet_balance_usd": 2750.01,
    "card_balance_usd": 1822.96,
    "wallet_balance_vnd": 274436000.0,
    "monthly_payin_vnd": 751111000.0,
    "monthly_payout_vnd": 466514000.0,
}

REAL_VIRTUAL_CARDS = [
    {
        "id": "card_volcano_0001",
        "card_name": "Volcano Ads",
        "masked_number": "•••• •••• •••• 0001",
        "card_type": "VIRTUAL_VISA",
        "currency": "USD",
        "balance": 1822.96,
        "status": "ACTIVE",
        "spending_limit_monthly": 10000.0,
    }
]

REAL_VIRTUAL_ACCOUNTS = [
    {
        "id": "va_etsy_01",
        "account_name": "Etsy Store US BIDV",
        "channel_source": "Etsy",
        "target_bank": "BIDV",
        "total_received": 1315868000.0,
        "currency": "VND",
        "status": "Active",
    },
    {
        "id": "va_payoneer_01",
        "account_name": "Payoneer Direct MSB",
        "channel_source": "Payoneer",
        "target_bank": "MSB",
        "total_received": 26405.19,
        "currency": "USD",
        "status": "Active",
    },
    {
        "id": "va_paypal_01",
        "account_name": "PayPal Global BIDV Premium",
        "channel_source": "Paypal",
        "target_bank": "BIDV_PREMIUM",
        "total_received": 32060.23,
        "currency": "USD",
        "status": "Active",
    },
    {
        "id": "va_etsy_02",
        "account_name": "Etsy Second Shop BIDV",
        "channel_source": "Etsy",
        "target_bank": "BIDV",
        "total_received": 957707000.0,
        "currency": "VND",
        "status": "Active",
    },
    {
        "id": "va_pingpong_01",
        "account_name": "PingPong Settlement MSB",
        "channel_source": "PingPong",
        "target_bank": "MSB",
        "total_received": 162236000.0,
        "currency": "VND",
        "status": "Process",  # Pending settlement
    },
]

# ==============================================================================
# 2. CANONICAL TIME-SERIES TRANSACTIONS
# ==============================================================================

def get_canonical_transactions() -> List[Transaction]:
    txs: List[Transaction] = []
    NOW = datetime.utcnow()

    # --- A. Live Screenshot Transactions (Current Week) ---

    # 1. Duplicate Top-up Anomaly on Volcano Ads Card ($250 x 2 within 11 mins)
    txs.append(Transaction(
        id="tw_topup_volcano_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(hours=2, minutes=14),
        amount=250.00,
        currency="USD",
        direction=TransactionDirection.CREDIT,
        transaction_type=TransactionType.TOP_UP,
        merchant_raw="Nạp tiền vào ví từ thẻ ****0001",
        merchant_normalized="Wealify Wallet Topup",
        source=TransactionSource.CARD,
        source_reference="TW9928109281",
        tags=["topup", "card_transfer"],
        notes="Nạp tiền vào ví từ thẻ Volcano Ads",
    ))
    txs.append(Transaction(
        id="tw_topup_volcano_02",
        account_id="acc_main",
        occurred_at=NOW - timedelta(hours=2, minutes=25),
        amount=250.00,
        currency="USD",
        direction=TransactionDirection.CREDIT,
        transaction_type=TransactionType.TOP_UP,
        merchant_raw="Nạp tiền vào ví từ thẻ ****0001",
        merchant_normalized="Wealify Wallet Topup",
        source=TransactionSource.CARD,
        source_reference="TW9928109270",
        tags=["topup", "card_transfer", "duplicate_anomaly"],
        notes="Nạp tiền vào ví từ thẻ Volcano Ads (Cách lệnh trên 11 phút)",
    ))

    # 2. SaaS Subscription on Card (Paddle.net)
    txs.append(Transaction(
        id="tw_sub_paddle_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=2, hours=15),
        amount=10.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.SUBSCRIPTION,
        merchant_raw="Subscription PADDLE.NET* VIRTUAL TOOL",
        merchant_normalized="Paddle.net",
        source=TransactionSource.CARD,
        source_reference="TW8819201928",
        tags=["subscription", "saas"],
    ))

    # 3. Virtual Account Transactions (VND Ledger from Screenshot 2)
    txs.append(Transaction(
        id="tw_va_payin_process",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=2, hours=10),
        amount=360.00,  # ~8,966,000 VND
        currency="USD",
        direction=TransactionDirection.CREDIT,
        transaction_type=TransactionType.PAYOUT,
        merchant_raw="Nạp tiền từ PingPong Settlement",
        merchant_normalized="PingPong",
        source=TransactionSource.ACCOUNT,
        source_reference="TW772819201",
        tags=["payout", "process", "pending_settlement"],
        notes="Trạng thái Process 8,966,000 VND",
    ))
    txs.append(Transaction(
        id="tw_va_withdrawal_msb",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=3, hours=5),
        amount=5350.00,  # ~133,414,000 VND
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.TRANSFER_TO_CARD,
        merchant_raw="Rút về ngân hàng MSB",
        merchant_normalized="MSB Bank Transfer",
        source=TransactionSource.ACCOUNT,
        source_reference="TW661920182",
        tags=["withdrawal", "bank_transfer"],
    ))

    # --- B. Spending Surge Timeline: Current Week vs Historical Weeks ---

    # Current Week Major Spike Charges: Meta Ads ($650) & AWS ($150) -> Total $1,050 vs $200 Baseline!
    txs.append(Transaction(
        id="tx_meta_ads_surge_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=1),
        amount=400.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.AD_SPEND,
        merchant_raw="FACEBK *ADS 83921948",
        merchant_normalized="Meta Facebook Ads",
        source=TransactionSource.CARD,
        tags=["ads", "marketing", "surge_driver"],
    ))
    txs.append(Transaction(
        id="tx_meta_ads_surge_02",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=3),
        amount=250.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.AD_SPEND,
        merchant_raw="FACEBK *ADS 83921948",
        merchant_normalized="Meta Facebook Ads",
        source=TransactionSource.CARD,
        tags=["ads", "marketing", "surge_driver"],
    ))
    txs.append(Transaction(
        id="tx_aws_surge_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=2),
        amount=150.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.EXPENSE,
        merchant_raw="AMAZON WEB SERVICES AWS.AMAZON.COM",
        merchant_normalized="Amazon Web Services",
        source=TransactionSource.CARD,
        tags=["cloud", "infrastructure", "surge_driver"],
    ))

    # Historical Week 1 (7 to 14 days ago - Baseline ~$200)
    txs.append(Transaction(
        id="tx_hist_w1_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=9),
        amount=100.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.AD_SPEND,
        merchant_raw="FACEBK *ADS",
        merchant_normalized="Meta Facebook Ads",
        source=TransactionSource.CARD,
        tags=["ads"],
    ))
    txs.append(Transaction(
        id="tx_hist_w1_02",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=11),
        amount=50.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.EXPENSE,
        merchant_raw="AMAZON WEB SERVICES",
        merchant_normalized="Amazon Web Services",
        source=TransactionSource.CARD,
        tags=["cloud"],
    ))
    txs.append(Transaction(
        id="tx_hist_w1_03",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=12),
        amount=50.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.FEE,
        merchant_raw="WEALIFY WIRE TRANSFER FEE",
        merchant_normalized="Wealify Fee",
        source=TransactionSource.ACCOUNT,
        tags=["fee"],
    ))

    # Historical Week 2 (14 to 21 days ago - Baseline ~$190)
    txs.append(Transaction(
        id="tx_hist_w2_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=16),
        amount=110.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.AD_SPEND,
        merchant_raw="FACEBK *ADS",
        merchant_normalized="Meta Facebook Ads",
        source=TransactionSource.CARD,
        tags=["ads"],
    ))
    txs.append(Transaction(
        id="tx_hist_w2_02",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=18),
        amount=40.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.SUBSCRIPTION,
        merchant_raw="OPENAI *CHATGPT PLUS",
        merchant_normalized="OpenAI",
        source=TransactionSource.CARD,
        tags=["subscription"],
    ))
    txs.append(Transaction(
        id="tx_hist_w2_03",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=19),
        amount=40.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.EXPENSE,
        merchant_raw="GOOGLE CLOUD SERVICES",
        merchant_normalized="Google Cloud",
        source=TransactionSource.CARD,
        tags=["cloud"],
    ))

    # Historical Week 3 (21 to 28 days ago - Baseline ~$210)
    txs.append(Transaction(
        id="tx_hist_w3_01",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=23),
        amount=120.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.AD_SPEND,
        merchant_raw="FACEBK *ADS",
        merchant_normalized="Meta Facebook Ads",
        source=TransactionSource.CARD,
        tags=["ads"],
    ))
    txs.append(Transaction(
        id="tx_hist_w3_02",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=25),
        amount=90.00,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.EXPENSE,
        merchant_raw="AMAZON WEB SERVICES",
        merchant_normalized="Amazon Web Services",
        source=TransactionSource.CARD,
        tags=["cloud"],
    ))

    # --- C. Other Core Subscriptions & Price Hike ---
    # Netflix Monthly
    txs.append(Transaction(
        id="tx_netflix_curr",
        account_id="acc_main",
        occurred_at=NOW - timedelta(days=4),
        amount=9.99,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        transaction_type=TransactionType.SUBSCRIPTION,
        merchant_raw="NETFLIX.COM* PAYMENT",
        merchant_normalized="Netflix",
        source=TransactionSource.CARD,
        tags=["subscription"],
    ))

    return txs
