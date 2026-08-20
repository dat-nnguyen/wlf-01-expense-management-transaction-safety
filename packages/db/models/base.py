import json
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, Text, Integer, ForeignKey
from packages.db.session import Base


class TransactionModel(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, index=True)
    account_id = Column(String(64), index=True, default="acc_main")
    occurred_at = Column(DateTime, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    direction = Column(String(16), default="debit")
    transaction_type = Column(String(32), default="unknown")
    merchant_raw = Column(String(255), nullable=False)
    merchant_normalized = Column(String(255), index=True)
    source = Column(String(32), default="account")
    source_reference = Column(String(128), nullable=True)
    status = Column(String(32), default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailModel(Base):
    __tablename__ = "emails"

    id = Column(String(64), primary_key=True, index=True)
    date = Column(DateTime, nullable=False, index=True)
    sender = Column(String(255), nullable=False)
    subject = Column(String(512), nullable=False)
    merchant = Column(String(255), index=True)
    amount = Column(Float, nullable=True)
    currency = Column(String(8), default="USD")
    body_snippet = Column(Text, nullable=True)
    email_type = Column(String(32), default="receipt")
    created_at = Column(DateTime, default=datetime.utcnow)


class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, index=True)
    alert_type = Column(String(32), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(String(64), nullable=False)
    reason = Column(Text, nullable=False)
    confidence = Column(Float, nullable=False)
    confidence_label = Column(String(64), nullable=False)
    deadline_days = Column(Integer, default=60)
    transaction_ids_json = Column(Text, default="[]")
    evidence_ids_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def transaction_ids(self):
        return json.loads(self.transaction_ids_json or "[]")

    @transaction_ids.setter
    def transaction_ids(self, val):
        self.transaction_ids_json = json.dumps(val)

    @property
    def evidence_ids(self):
        return json.loads(self.evidence_ids_json or "[]")

    @evidence_ids.setter
    def evidence_ids(self, val):
        self.evidence_ids_json = json.dumps(val)


class SubscriptionModel(Base):
    __tablename__ = "subscriptions"

    id = Column(String(64), primary_key=True, index=True)
    merchant = Column(String(255), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    cadence = Column(String(32), default="monthly")
    last_billed_at = Column(DateTime, nullable=False)
    next_billing_estimated = Column(DateTime, nullable=False)
    annual_cost = Column(Float, nullable=False)
    price_changed = Column(Boolean, default=False)
    previous_amount = Column(Float, nullable=True)
    status = Column(String(32), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)


class AgentRunModel(Base):
    __tablename__ = "agent_runs"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), index=True)
    user_message = Column(Text, nullable=False)
    intent = Column(String(64), nullable=True)
    plan_json = Column(Text, default="[]")
    tool_calls_json = Column(Text, default="[]")
    tool_results_json = Column(Text, default="[]")
    final_answer = Column(Text, nullable=False)
    policy_decision = Column(String(32), default="ALLOW")
    created_at = Column(DateTime, default=datetime.utcnow)
