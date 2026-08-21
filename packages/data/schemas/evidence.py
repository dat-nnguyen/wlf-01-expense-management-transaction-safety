from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceType(str, Enum):
    CARD_STATEMENT = "card_statement"
    EMAIL_RECEIPT = "email_receipt"
    BANK_RECORD = "bank_record"
    WALLET_RECORD = "wallet_record"
    RECURRING_PATTERN = "recurring_pattern"


class Evidence(BaseModel):
    """Evidence model proving why a conclusion/alert was reached."""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Evidence ID")
    evidence_type: EvidenceType
    source: str = Field(..., description="Source origin, e.g., Card Statement #123")
    source_id: str = Field(..., description="ID within the origin system")
    transaction_id: Optional[str] = Field(default=None)
    content: Dict[str, Any] = Field(default_factory=dict, description="Structured facts")
    confidence_weight: float = Field(default=1.0, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
