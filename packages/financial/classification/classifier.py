import re
from typing import Optional
from packages.data.schemas.transaction import Transaction, TransactionType, TransactionDirection

SUBSCRIPTION_KEYWORDS = [
    "netflix", "spotify", "chatgpt", "openai", "youtube premium", "icloud",
    "adobe", "github", "prime", "dropbox", "midjourney", "patreon", "figma",
    "notion", "canva", "slack", "paddle", "lemon", "apple.com/bill", "zoom",
]

AD_SPEND_KEYWORDS = [
    "facebook", "meta *ads", "facebk", "google *ads", "google ads", "tiktok ads",
    "bytedance", "volcano", "ads", "advertising", "bing ads", "twitter ads",
]

CLOUD_INFRA_KEYWORDS = [
    "aws", "amazon web services", "cloud", "digitalocean", "cloudflare", "linode", "vultr", "gcp",
]

FEE_KEYWORDS = [
    "fee", "service charge", "atm", "interest", "late charge", "overdraft", "fx fee", "wire fee", "bank fee",
]

TRANSFER_KEYWORDS = [
    "transfer", "wire", "p2p", "wallet topup", "deposit", "withdraw", "rút về", "nạp ví", "nạp tiền",
]

PAYOUT_KEYWORDS = [
    "payout", "settlement", "disbursement", "stripe", "amazon payout", "shopify", "payoneer", "pingpong", "paypal payout",
]


def classify_transaction(tx: Transaction) -> TransactionType:
    """
    Two-Tier Transaction Classifier:
    Tier 1: Fast Rule & Merchant Signature Match.
    Tier 2: Semantic fallback classification based on amount, direction, and descriptor tokens.
    """
    merchant = (tx.merchant_normalized or tx.merchant_raw or "").lower()

    # 1. Check Ad Spend
    if any(k in merchant for k in AD_SPEND_KEYWORDS):
        return TransactionType.AD_SPEND

    # 2. Check SaaS / Subscriptions
    if any(k in merchant for k in SUBSCRIPTION_KEYWORDS):
        return TransactionType.SUBSCRIPTION

    # 3. Check Cloud Infrastructure
    if any(k in merchant for k in CLOUD_INFRA_KEYWORDS):
        return TransactionType.SUBSCRIPTION

    # 4. Check Banking & Service Fees
    if any(k in merchant for k in FEE_KEYWORDS):
        return TransactionType.FEE

    # 5. Check Internal & Cross-account Transfers
    if any(k in merchant for k in TRANSFER_KEYWORDS):
        if "card" in merchant or "thẻ" in merchant:
            return TransactionType.TRANSFER_TO_CARD
        return TransactionType.TRANSFER

    # 6. Check Incoming Payouts / Disbursements
    if tx.direction == TransactionDirection.CREDIT:
        if any(k in merchant for k in PAYOUT_KEYWORDS):
            return TransactionType.PAYOUT
        return TransactionType.PAYIN

    # 7. Card purchase vs General Debit
    if tx.source.value == "card" or tx.card_id:
        return TransactionType.CARD_PURCHASE

    return TransactionType.PAYOUT

