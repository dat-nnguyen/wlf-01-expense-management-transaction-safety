from typing import List, Optional
from sqlalchemy.orm import Session
from packages.db.models.base import AlertModel
from packages.data.schemas.alert import Alert, AlertStatus, AlertType


class AlertRepository:
    def __init__(self, db: Session):
        self.db = db

    def to_schema(self, m: AlertModel) -> Alert:
        return Alert(
            id=m.id,
            alert_type=AlertType(m.alert_type),
            title=m.title,
            status=AlertStatus(m.status),
            reason=m.reason,
            confidence=m.confidence,
            confidence_label=m.confidence_label,
            deadline_days=m.deadline_days,
            transaction_ids=m.transaction_ids,
            evidence_ids=m.evidence_ids,
            created_at=m.created_at,
        )

    def get_all(self, limit: int = 50) -> List[Alert]:
        models = self.db.query(AlertModel).order_by(AlertModel.created_at.desc()).limit(limit).all()
        return [self.to_schema(m) for m in models]

    def save(self, alert: Alert) -> Alert:
        existing = self.db.query(AlertModel).filter(AlertModel.id == alert.id).first()
        if not existing:
            m = AlertModel(
                id=alert.id,
                alert_type=alert.alert_type.value,
                title=alert.title,
                status=alert.status.value,
                reason=alert.reason,
                confidence=alert.confidence,
                confidence_label=alert.confidence_label,
                deadline_days=alert.deadline_days,
            )
            m.transaction_ids = alert.transaction_ids
            m.evidence_ids = alert.evidence_ids
            self.db.add(m)
            self.db.commit()
        return alert

    def save_many(self, alerts: List[Alert]) -> int:
        for a in alerts:
            self.save(a)
        return len(alerts)
