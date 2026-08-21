import re
import io
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Union
import pypdf

from packages.data.schemas.transaction import (
    Transaction,
    TransactionDirection,
    TransactionSource,
    TransactionType,
)
from packages.data.normalization.normalizer import normalize_merchant, normalize_amount
from packages.observability.logging import logger


def extract_text_from_pdf(source: Union[str, Path, bytes, io.BytesIO]) -> str:
    """Extract raw text from PDF file or stream."""
    try:
        if isinstance(source, (str, Path)):
            path = Path(source)
            if path.exists():
                reader = pypdf.PdfReader(str(path))
            else:
                # Might be raw text or missing file
                return str(source)
        elif isinstance(source, bytes):
            reader = pypdf.PdfReader(io.BytesIO(source))
        else:
            reader = pypdf.PdfReader(source)

        text_parts = []
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text_parts.append(extracted)
        return "\n".join(text_parts)
    except Exception as ex:
        logger.error(f"Error extracting PDF text: {ex}")
        return ""


def parse_transactions_pdf(
    source_content: Union[str, Path, bytes, io.BytesIO],
    source_type: TransactionSource = TransactionSource.ACCOUNT,
    account_id: str = "acc_main",
    bank_name: str = "Vietcombank",
) -> List[Transaction]:
    """
    Parse PDF Bank & Card Account Statements into canonical Transactions.
    Extracts date, description/merchant, amount, currency, and type.
    """
    raw_text = extract_text_from_pdf(source_content)
    if not raw_text.strip():
        return []

    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    transactions: List[Transaction] = []

    # Common bank statement transaction line patterns:
    # Example 1: 2026-08-15 | NETFLIX.COM | -$15.49 | Card #4812
    # Example 2: 15/08/2026 AMAZON PAYOUT +$4,250.00 COMPLETED
    # Example 3: Aug 12, 2026 FACEBOOK *ADS $150.00 DEBIT
    date_pattern = re.compile(
        r"^(\d{4}-\d{2}-\d{2}|\d{1,2}/\d{1,2}/\d{2,4}|[A-Za-z]{3}\s+\d{1,2},?\s+\d{4})"
    )
    amount_pattern = re.compile(r"([+-]?\$?\s?[0-9,]+(?:\.[0-9]{1,2})?)")

    for idx, line in enumerate(lines):
        # Ignore header/footer lines
        if any(h in line.lower() for h in ["statement period", "account summary", "page ", "opening balance", "closing balance", "date description amount"]):
            continue

        date_match = date_pattern.search(line)
        if not date_match:
            continue

        date_str = date_match.group(1)
        occurred_at = datetime.now(timezone.utc)
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%b %d, %Y", "%b %d %Y", "%d/%m/%y"):
            try:
                occurred_at = datetime.strptime(date_str, fmt)
                break
            except ValueError:
                continue

        # Extract amount and sign
        # Look for numbers with $ or decimal point
        amounts = amount_pattern.findall(line)
        if not amounts:
            continue

        # Usually amount is the last or second last number
        raw_amt_str = amounts[-1]
        amount = normalize_amount(raw_amt_str)
        if amount == 0.0:
            continue

        # Determine direction
        direction = TransactionDirection.DEBIT
        if "+" in line or "credit" in line.lower() or "deposit" in line.lower() or "cộng" in line.lower():
            direction = TransactionDirection.CREDIT
        elif "-" in raw_amt_str or "debit" in line.lower() or "trừ" in line.lower():
            direction = TransactionDirection.DEBIT

        # Extract merchant/description by removing date and amount
        desc_text = line
        desc_text = date_pattern.sub("", desc_text, count=1)
        desc_text = amount_pattern.sub("", desc_text)
        desc_text = re.sub(r"[|,;\t]", " ", desc_text)
        desc_text = re.sub(r"\s+", " ", desc_text).strip()
        if not desc_text:
            desc_text = "Chưa xác định được"

        normalized_merchant, merchant_explanation = normalize_merchant(desc_text)

        # Classification
        m_lower = (normalized_merchant or desc_text).lower()
        if any(k in m_lower for k in ["transfer to card", "topup card", "nạp thẻ", "sang the"]):
            tx_type = TransactionType.TRANSFER_TO_CARD
            tags = ["transfer_to_card"]
        elif any(ad in m_lower for ad in ["facebook", "meta ads", "google ads", "tiktok ads", "facebk"]):
            tx_type = TransactionType.AD_SPEND
            tags = ["ad_spend"]
        elif any(s in m_lower for s in ["netflix", "adobe", "openai", "chatgpt", "spotify", "canva", "figma"]):
            tx_type = TransactionType.SUBSCRIPTION
            tags = ["subscription"]
        elif any(k in m_lower for k in ["fee", "phí", "atm", "service charge"]):
            tx_type = TransactionType.FEE
            tags = ["fee"]
        elif any(k in m_lower for k in ["wallet", "ví", "topup", "chuyển tiền"]):
            tx_type = TransactionType.TRANSFER
            tags = ["transfer"]
        elif direction == TransactionDirection.CREDIT:
            tx_type = TransactionType.PAYIN
            tags = ["payout" if "payout" in m_lower or "settlement" in m_lower else "income"]
        else:
            tx_type = TransactionType.CARD_PURCHASE if source_type == TransactionSource.CARD else TransactionType.EXPENSE
            tags = ["expense"]

        card_match = re.search(r"(?:card|thẻ|\.{3,4})\s*(?:#|no\.?)?\s*([0-9]{4})", line, re.IGNORECASE)
        card_id = f"card_{card_match.group(1)}" if card_match else None

        ref_match = re.search(r"(?:ref|id|mã|txn)[:#\s]+([A-Za-z0-9_-]+)", line, re.IGNORECASE)
        ref_id = ref_match.group(1) if ref_match else f"pdf_ref_{idx+1}"

        transactions.append(
            Transaction(
                id=f"{source_type.value}_pdf_{idx+1}",
                account_id=account_id,
                occurred_at=occurred_at,
                amount=amount,
                currency="USD",
                direction=direction,
                transaction_type=tx_type,
                merchant_raw=desc_text,
                merchant_normalized=normalized_merchant,
                merchant_explanation=merchant_explanation,
                source=source_type,
                source_reference=ref_id,
                card_id=card_id,
                bank_name=bank_name,
                tags=tags,
                status="completed",
            )
        )

    return transactions
