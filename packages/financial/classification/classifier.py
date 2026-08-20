import re
from typing import Optional
from packages.data.schemas.transaction import Transaction, TransactionType, TransactionDirection

SUBSCRIPTION_KEYWORDS = [
    "netflix", "spotify", "chatgpt", "openai", "youtube premium", "icloud",
    "adobe", "github", "prime", "dropbox", "midjourney", "patreon"
]

FEE_KEYWORDS = ["fee", "service charge", "atm", "interest", "late charge", "overdraft"]
TRANSFER_KEYWORDS = ["transfer", "wire", "p2p", "wallet topup", "deposit", "withdraw"]


def classify_transaction(tx: Transaction) -> TransactionType:
    """Deterministic transaction classification rule engine."""
    merchant = (tx.merchant_normalized or tx.merchant_raw).lower()

    if any(k in merchant for k in SUBSCRIPTION_KEYWORDS):
        return TransactionType.SUBSCRIPTION

    if any(k in merchant for k in FEE_KEYWORDS):
        return TransactionType.FEE

    if any(k in merchant for k in TRANSFER_KEYWORDS):
        return TransactionType.TRANSFER

    if tx.direction == TransactionDirection.CREDIT:
        return TransactionType.PAYIN

    if tx.source.value == "card":
        return TransactionType.CARD_PURCHASE

    return TransactionType.PAYOUT
