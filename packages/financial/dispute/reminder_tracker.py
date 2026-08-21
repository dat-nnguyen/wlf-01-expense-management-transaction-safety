import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


class DisputeReminder(BaseModel):
    id: str
    transaction_id: str
    alert_id: Optional[str] = None
    merchant: str
    amount: float
    statement_date: str  # DD/MM/YYYY
    deadline_date: str   # DD/MM/YYYY (Statement date + 60 days)
    days_remaining: int
    notes: str
    status: str = "ACTIVE"  # "ACTIVE", "RESOLVED", "EXPIRED"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ReminderTracker:
    """
    60-Day Dispute Deadline & Reminder Tracking System.
    - Calculates deadline: statement_date + 60 days
    - Displays deadline and countdown
    - Creates and tracks reminders without duplicates
    """

    _storage: Dict[str, DisputeReminder] = {}

    @classmethod
    def calculate_deadline(
        cls,
        statement_date: datetime,
        current_date: Optional[datetime] = None,
    ) -> Tuple[datetime, int]:
        current_date = current_date or datetime.now(timezone.utc)
        deadline = statement_date + timedelta(days=60)
        days_left = (deadline.date() - current_date.date()).days
        return deadline, max(0, days_left)

    @classmethod
    def create_reminder(
        cls,
        transaction_id: str,
        merchant: str,
        amount: float,
        statement_date: datetime,
        alert_id: Optional[str] = None,
        notes: str = "",
    ) -> Tuple[bool, DisputeReminder, str]:
        # Check duplicate reminder for same transaction
        for r in cls._storage.values():
            if r.transaction_id == transaction_id and r.status == "ACTIVE":
                return False, r, f"Nhắc nhở khiếu nại cho giao dịch {transaction_id} (${amount:,.2f}) đã tồn tại."

        deadline, days_left = cls.calculate_deadline(statement_date)
        reminder_id = f"rem_{uuid.uuid4().hex[:8]}"

        reminder = DisputeReminder(
            id=reminder_id,
            transaction_id=transaction_id,
            alert_id=alert_id,
            merchant=merchant,
            amount=amount,
            statement_date=statement_date.strftime("%d/%m/%Y"),
            deadline_date=deadline.strftime("%d/%m/%Y"),
            days_remaining=days_left,
            notes=notes or f"Hạn khiếu nại theo luật 60 ngày: {deadline.strftime('%d/%m/%Y')} (Còn {days_left} ngày)",
            status="ACTIVE",
        )
        cls._storage[reminder_id] = reminder
        return True, reminder, "Đã tạo lịch nhắc nhở khiếu nại thành công."

    @classmethod
    def list_reminders(cls, status: Optional[str] = None) -> List[DisputeReminder]:
        # Update days remaining dynamically
        now = datetime.now(timezone.utc)
        res: List[DisputeReminder] = []
        for r in cls._storage.values():
            try:
                d_obj = datetime.strptime(r.deadline_date, "%d/%m/%Y")
                r.days_remaining = max(0, (d_obj.date() - now.date()).days)
                if r.days_remaining == 0 and r.status == "ACTIVE":
                    r.status = "EXPIRED"
            except Exception:
                pass

            if not status or r.status.upper() == status.upper():
                res.append(r)
        return sorted(res, key=lambda x: x.days_remaining)

    @classmethod
    def resolve_reminder(cls, reminder_id: str) -> bool:
        if reminder_id in cls._storage:
            cls._storage[reminder_id].status = "RESOLVED"
            return True
        return False

    @classmethod
    def delete_reminder(cls, reminder_id: str) -> bool:
        if reminder_id in cls._storage:
            del cls._storage[reminder_id]
            return True
        return False

    @classmethod
    def clear_all(cls):
        cls._storage.clear()


# Initialize with a realistic sample reminder for demo
def _seed_initial_reminders():
    now = datetime.now(timezone.utc)
    stmt_date = now - timedelta(days=48)
    ReminderTracker.create_reminder(
        transaction_id="card_0001",
        merchant="Facebook Ads (Meta)",
        amount=150.0,
        statement_date=stmt_date,
        notes="Tra soát khoản quẹt đúp 2 lần cách nhau 105 giây trên thẻ ảo Volcano Ads •••• 4812.",
    )

_seed_initial_reminders()
