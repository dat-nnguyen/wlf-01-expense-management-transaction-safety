from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class EmailType(str, Enum):
    RECEIPT = "receipt"
    SUBSCRIPTION_UPDATE = "subscription_update"
    TRANSFER_CONFIRMATION = "transfer_confirmation"
    PAYOUT_NOTIFICATION = "payout_notification"
    ALERT = "alert"
    OTHER = "other"


class EmailEvidence(BaseModel):
    """Canonical Email Evidence Model extracted from user mailbox."""
    id: str = Field(..., description="Unique message ID")
    date: datetime = Field(..., description="Email received timestamp")
    sender: str = Field(..., description="Sender email or name")
    subject: str = Field(..., description="Subject line")
    merchant: str = Field(..., description="Normalized merchant name identified from email")
    amount: Optional[float] = Field(default=None, description="Extracted monetary amount if any")
    currency: Optional[str] = Field(default="USD")
    body_snippet: Optional[str] = Field(default=None, description="Sanitized excerpt for evidence")
    email_type: EmailType = Field(default=EmailType.RECEIPT)
    payout_ref: Optional[str] = Field(default=None, description="Extracted payout / transfer reference code")
    expected_settlement_days: int = Field(default=3, description="Expected settlement SLA days (e.g. 2-3 business days)")

    class Config:
        from_attributes = True
