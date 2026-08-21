import csv
import io
from datetime import datetime
from typing import List, Union
from pathlib import Path
from packages.data.schemas.transaction import (
    Transaction,
    TransactionDirection,
    TransactionSource,
    TransactionType,
)
from packages.data.normalization.normalizer import normalize_merchant_name, normalize_amount


def parse_transactions_csv(
    source_content: Union[str, Path, bytes],
    source_type: TransactionSource = TransactionSource.ACCOUNT,
    account_id: str = "acc_main",
) -> List[Transaction]:
    """
    Parse generic CSV bank/card statements into canonical Transactions.
    Supports comma and semicolon separated CSV content.
    """
    if isinstance(source_content, bytes):
        text = source_content.decode("utf-8")
    elif isinstance(source_content, Path) or (isinstance(source_content, str) and "\n" not in source_content and Path(source_content).exists()):
        text = Path(source_content).read_text(encoding="utf-8")
    else:
        text = str(source_content)

    reader = csv.DictReader(io.StringIO(text.strip()))
    transactions: List[Transaction] = []

    for idx, row in enumerate(reader):
        # Normalize key names
        cleaned_row = {k.strip().lower().replace(" ", "_"): v.strip() for k, v in row.items() if k}
        
        tx_id = cleaned_row.get("id") or cleaned_row.get("transaction_id") or f"{source_type.value}_{idx+1}"
        date_str = cleaned_row.get("date") or cleaned_row.get("occurred_at") or cleaned_row.get("timestamp")
        
        # Parse datetime
        occurred_at = datetime.utcnow()
        if date_str:
            for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%dT%H:%M:%S"):
                try:
                    occurred_at = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    continue

        raw_amount = cleaned_row.get("amount") or "0.0"
        amount = normalize_amount(raw_amount)
        currency = cleaned_row.get("currency") or "USD"
        
        raw_direction = cleaned_row.get("direction", "debit").lower()
        direction = TransactionDirection.CREDIT if "credit" in raw_direction or "in" in raw_direction else TransactionDirection.DEBIT
        
        raw_merchant = cleaned_row.get("merchant") or cleaned_row.get("description") or cleaned_row.get("payee") or "Unknown"
        normalized_merchant = normalize_merchant_name(raw_merchant)
        
        tx_type_raw = cleaned_row.get("type", "").lower()
        tx_type = TransactionType.UNKNOWN
        tags = []

        m_lower = (normalized_merchant or raw_merchant).lower()
        if any(ad in m_lower for ad in ["facebook *ads", "google *ads", "tiktok ads", "meta ads"]):
            tx_type = TransactionType.AD_SPEND
            tags.append("ad_spend")
        elif "sub" in tx_type_raw or any(s in m_lower for s in ["netflix", "adobe", "openai", "chatgpt", "spotify"]):
            tx_type = TransactionType.SUBSCRIPTION
            tags.append("subscription")
        elif "fee" in tx_type_raw or "atm" in m_lower:
            tx_type = TransactionType.FEE
            tags.append("fee")
        elif "transfer" in tx_type_raw or "wallet" in m_lower:
            tx_type = TransactionType.TRANSFER
            tags.append("transfer")
        elif "payin" in tx_type_raw or direction == TransactionDirection.CREDIT:
            tx_type = TransactionType.PAYIN
            tags.append("payout" if "payout" in m_lower or "settlement" in m_lower else "income")
        elif "card" in tx_type_raw or source_type == TransactionSource.CARD:
            tx_type = TransactionType.CARD_PURCHASE
            tags.append("card")

        card_id = cleaned_row.get("card_id")
        bank_name = cleaned_row.get("bank_name") or ("Vietcombank" if source_type == TransactionSource.ACCOUNT else "VPBank")

        transactions.append(
            Transaction(
                id=tx_id,
                account_id=cleaned_row.get("account_id", account_id),
                occurred_at=occurred_at,
                amount=amount,
                currency=currency,
                direction=direction,
                transaction_type=tx_type,
                merchant_raw=raw_merchant,
                merchant_normalized=normalized_merchant,
                source=source_type,
                source_reference=cleaned_row.get("ref_id") or cleaned_row.get("reference"),
                card_id=card_id,
                bank_name=bank_name,
                tags=tags,
                status=cleaned_row.get("status", "completed"),
            )
        )

    return transactions
