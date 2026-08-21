from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class TransactionDirection(str, Enum):
    DEBIT = "debit"
    CREDIT = "credit"


class TransactionType(str, Enum):
    CARD_PURCHASE = "card_purchase"
    SUBSCRIPTION = "subscription"
    TRANSFER = "transfer"
    TRANSFER_TO_CARD = "transfer_to_card"
    TOP_UP = "top_up"
    FEE = "fee"
    PAYIN = "payin"
    PAYOUT = "payout"
    AD_SPEND = "ad_spend"
    EXPENSE = "expense"
    UNKNOWN = "unknown"


class TransactionSource(str, Enum):
    ACCOUNT = "account"
    CARD = "card"
    WALLET = "wallet"


class Transaction(BaseModel):
    """Canonical Transaction Model across all data sources."""
    id: str = Field(..., description="Unique transaction ID")
    account_id: str = Field(default="acc_default", description="Associated account identifier")
    occurred_at: datetime = Field(..., description="Timestamp of transaction occurrence")
    amount: float = Field(..., description="Monetary amount (absolute positive value)")
    currency: str = Field(default="USD", description="Currency code (ISO 4217)")
    direction: TransactionDirection = Field(default=TransactionDirection.DEBIT)
    transaction_type: TransactionType = Field(default=TransactionType.UNKNOWN)
    merchant_raw: str = Field(..., description="Raw merchant or payee description")
    merchant_normalized: str = Field(default="", description="Normalized merchant name")
    source: TransactionSource = Field(default=TransactionSource.ACCOUNT)
    source_reference: Optional[str] = Field(default=None, description="External statement/ref ID")
    card_id: Optional[str] = Field(default=None, description="Virtual Card Identifier if card source")
    bank_name: Optional[str] = Field(default=None, description="Bank association (e.g. Vietcombank, Techcombank, VPBank)")
    tags: List[str] = Field(default_factory=list, description="Categorization tags like ads, saas, payout")
    status: str = Field(default="completed")

    class Config:
        from_attributes = True
