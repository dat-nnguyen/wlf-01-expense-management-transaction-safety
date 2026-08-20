import json
from datetime import datetime
from typing import List, Union
from pathlib import Path
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.data.normalization.normalizer import normalize_merchant_name, normalize_amount


def parse_emails_json(source_content: Union[str, Path, bytes, list]) -> List[EmailEvidence]:
    """Parse JSON records containing extracted emails into EmailEvidence schemas."""
    if isinstance(source_content, bytes):
        raw = json.loads(source_content.decode("utf-8"))
    elif isinstance(source_content, Path) or (isinstance(source_content, str) and not source_content.strip().startswith("[") and Path(source_content).exists()):
        raw = json.loads(Path(source_content).read_text(encoding="utf-8"))
    elif isinstance(source_content, str):
        raw = json.loads(source_content)
    else:
        raw = source_content

    emails: List[EmailEvidence] = []
    for item in raw:
        email_id = item.get("id", f"em_{len(emails)+1}")
        date_str = item.get("date") or item.get("received_at")
        date_val = datetime.utcnow()
        if date_str:
            for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
                try:
                    date_val = datetime.strptime(date_str, fmt)
                    break
                except ValueError:
                    continue

        merchant_raw = item.get("merchant") or item.get("sender") or "Unknown"
        amount_val = normalize_amount(item["amount"]) if item.get("amount") is not None else None
        
        type_str = str(item.get("email_type", "receipt")).lower()
        email_type = EmailType.RECEIPT
        if "subscription" in type_str:
            email_type = EmailType.SUBSCRIPTION_UPDATE
        elif "transfer" in type_str:
            email_type = EmailType.TRANSFER_CONFIRMATION

        emails.append(
            EmailEvidence(
                id=email_id,
                date=date_val,
                sender=item.get("sender", "service@merchant.com"),
                subject=item.get("subject", "Receipt / Notification"),
                merchant=normalize_merchant_name(merchant_raw),
                amount=amount_val,
                currency=item.get("currency", "USD"),
                body_snippet=item.get("body_snippet") or item.get("snippet"),
                email_type=email_type,
            )
        )
    return emails
