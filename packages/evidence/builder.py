import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from packages.data.schemas.evidence import Evidence, EvidenceType
from packages.data.schemas.transaction import Transaction
from packages.data.schemas.email import EmailEvidence


class EvidenceBuilder:
    """Builder utility for structured evidence objects."""

    @staticmethod
    def from_transaction(tx: Transaction) -> Evidence:
        return Evidence(
            id=f"ev_tx_{tx.id}",
            evidence_type=EvidenceType.CARD_STATEMENT if tx.source.value == "card" else EvidenceType.BANK_RECORD,
            source=f"{tx.source.value.title()} Statement",
            source_id=tx.id,
            transaction_id=tx.id,
            content={
                "merchant": tx.merchant_normalized or tx.merchant_raw,
                "amount": tx.amount,
                "currency": tx.currency,
                "date": tx.occurred_at.isoformat(),
                "source": tx.source.value,
                "direction": tx.direction.value,
            },
            confidence_weight=1.0,
            created_at=datetime.now(timezone.utc),
        )

    @staticmethod
    def from_email(email: EmailEvidence, linked_tx_id: Optional[str] = None) -> Evidence:
        return Evidence(
            id=f"ev_em_{email.id}",
            evidence_type=EvidenceType.EMAIL_RECEIPT,
            source=f"Email ({email.sender})",
            source_id=email.id,
            transaction_id=linked_tx_id,
            content={
                "sender": email.sender,
                "subject": email.subject,
                "merchant": email.merchant,
                "amount": email.amount,
                "currency": email.currency,
                "date": email.date.isoformat(),
                "snippet": email.body_snippet,
            },
            confidence_weight=0.9,
            created_at=datetime.now(timezone.utc),
        )

    @staticmethod
    def from_recurring_pattern(merchant: str, history: List[Transaction]) -> Evidence:
        return Evidence(
            id=f"ev_rec_{uuid.uuid4().hex[:8]}",
            evidence_type=EvidenceType.RECURRING_PATTERN,
            source="Financial Engine Pattern Analyzer",
            source_id=merchant,
            transaction_id=history[-1].id if history else None,
            content={
                "merchant": merchant,
                "occurrences": len(history),
                "dates": [t.occurred_at.strftime("%Y-%m-%d") for t in history],
                "amounts": [t.amount for t in history],
            },
            confidence_weight=0.95,
            created_at=datetime.now(timezone.utc),
        )
