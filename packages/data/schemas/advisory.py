from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HealthRating(str, Enum):
    HEALTHY = "HEALTHY"
    WARNING = "WARNING"
    CRITICAL_RISK = "CRITICAL_RISK"


class HITLActionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class HITLActionItem(BaseModel):
    id: str = Field(..., description="Action ID")
    title: str
    description: str
    action_type: str = Field(..., description="E.g., pause_ad_campaign, draft_payout_ticket, dispute_charge")
    payload: Dict[str, Any] = Field(default_factory=dict)
    status: HITLActionStatus = Field(default=HITLActionStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


class UnitEconomicsMetrics(BaseModel):
    total_ad_spend: float = 0.0
    total_payout_received: float = 0.0
    total_payout_pending: float = 0.0
    total_subscriptions: float = 0.0
    net_operating_profit: float = 0.0
    roas: float = 0.0  # Return on Ad Spend
    payout_lag_days_avg: float = 0.0
    burn_rate_daily: float = 0.0
    estimated_runway_days: int = 0


class BusinessHealthReport(BaseModel):
    account_id: str
    rating: HealthRating
    health_score: int = Field(ge=0, le=100, description="0 to 100 health score")
    summary: str
    metrics: UnitEconomicsMetrics
    insights: List[str] = Field(default_factory=list)
    action_recommendations: List[str] = Field(default_factory=list)
    hitl_actions: List[HITLActionItem] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
