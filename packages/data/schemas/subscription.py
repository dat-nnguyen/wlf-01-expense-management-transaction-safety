from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class SubscriptionCadence(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Subscription(BaseModel):
    """Detected recurring subscription information."""
    id: str = Field(..., description="Subscription ID")
    merchant: str = Field(..., description="Normalized merchant name")
    amount: float = Field(..., description="Latest billed amount")
    currency: str = Field(default="USD")
    cadence: SubscriptionCadence = Field(default=SubscriptionCadence.MONTHLY)
    last_billed_at: datetime
    next_billing_estimated: datetime
    annual_cost: float
    price_changed: bool = Field(default=False)
    previous_amount: Optional[float] = None
    transaction_ids: List[str] = Field(default_factory=list)
    status: str = Field(default="active")

    class Config:
        from_attributes = True
