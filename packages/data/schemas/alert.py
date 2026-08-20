from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class AlertStatus(str, Enum):
    RECURRING_CONFIRMED = "Định kỳ đã xác định"
    NEEDS_USER_CONFIRMATION = "Cần bạn tự xác nhận"
    INSUFFICIENT_DATA = "Chưa đủ dữ liệu"


class AlertType(str, Enum):
    DUPLICATE = "duplicate"
    UNRECONCILED = "unreconciled"
    SUBSCRIPTION = "subscription"
    PRICE_HIKE = "price_hike"
    UNKNOWN_FEE = "unknown_fee"


class Alert(BaseModel):
    """Canonical Alert Model adhering to 3 standard statuses."""
    id: str = Field(..., description="Alert ID")
    alert_type: AlertType
    title: str
    status: AlertStatus
    reason: str
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_label: str = Field(..., description="E.g., Mức độ tin cậy cao")
    deadline_days: Optional[int] = Field(default=60, description="Dispute deadline if applicable")
    transaction_ids: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
