from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AlertStatus(str, Enum):
    RECURRING_CONFIRMED = "Định kỳ đã xác định"
    NEEDS_USER_CONFIRMATION = "Cần bạn tự xác nhận"
    INSUFFICIENT_DATA = "Chưa đủ dữ liệu"


class AlertType(str, Enum):
    DUPLICATE = "duplicate"
    OVERDUE_PAYOUT = "overdue_payout"
    UNRECONCILED = "unreconciled"
    SUBSCRIPTION = "subscription"
    PRICE_HIKE = "price_hike"
    UNKNOWN_FEE = "unknown_fee"
    BUSINESS_RISK = "business_risk"


class Alert(BaseModel):
    """Canonical Alert Model adhering to 3 standard statuses."""
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Alert ID")
    alert_type: AlertType
    title: str
    status: AlertStatus
    reason: str
    confidence: float = Field(ge=0.0, le=1.0)
    confidence_label: str = Field(..., description="E.g., Mức độ tin cậy cao")
    deadline_days: Optional[int] = Field(default=60, description="Dispute deadline if applicable")
    days_overdue: Optional[int] = Field(default=None, description="Days overdue for delayed payouts")
    card_id: Optional[str] = Field(default=None, description="Target virtual card ID")
    bank_name: Optional[str] = Field(default=None, description="Target bank name")
    amount: Optional[float] = Field(default=None, description="Relevant amount involved")
    dispute_draft: Optional[str] = Field(default=None, description="Pre-filled dispute email / ticket text")
    action_suggestion: Optional[str] = Field(default=None, description="Recommended next action")
    transaction_ids: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
