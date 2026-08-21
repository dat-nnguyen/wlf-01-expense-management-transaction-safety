from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from packages.financial.dispute.reminder_tracker import ReminderTracker, DisputeReminder

router = APIRouter(prefix="/api/v1/reminders", tags=["60-Day Dispute Reminders"])


class CreateReminderRequest(BaseModel):
    transaction_id: str
    merchant: str
    amount: float
    statement_date: Optional[str] = None  # YYYY-MM-DD or DD/MM/YYYY
    alert_id: Optional[str] = None
    notes: Optional[str] = None


class ReminderActionResponse(BaseModel):
    success: bool
    message: str
    reminder: Optional[DisputeReminder] = None


@router.get("", response_model=List[DisputeReminder])
async def list_reminders(status: Optional[str] = Query(None, description="Filter by ACTIVE, RESOLVED, EXPIRED")):
    """
    List all 60-day dispute deadline reminders with real-time days remaining countdown.
    """
    return ReminderTracker.list_reminders(status=status)


@router.post("", response_model=ReminderActionResponse)
async def create_reminder(req: CreateReminderRequest):
    """
    Create a new dispute reminder with statutory 60-day deadline calculation.
    Enforces duplicate prevention: will not create multiple reminders for the same transaction.
    """
    stmt_dt = datetime.now(timezone.utc)
    if req.statement_date:
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
            try:
                stmt_dt = datetime.strptime(req.statement_date, fmt)
                break
            except ValueError:
                continue

    success, reminder, msg = ReminderTracker.create_reminder(
        transaction_id=req.transaction_id,
        merchant=req.merchant,
        amount=req.amount,
        statement_date=stmt_dt,
        alert_id=req.alert_id,
        notes=req.notes or "",
    )
    return ReminderActionResponse(success=success, message=msg, reminder=reminder)


@router.post("/{reminder_id}/resolve", response_model=ReminderActionResponse)
async def resolve_reminder(reminder_id: str):
    """
    Mark a reminder as resolved.
    """
    ok = ReminderTracker.resolve_reminder(reminder_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Reminder not found.")
    return ReminderActionResponse(success=True, message=f"Nhắc nhở {reminder_id} đã được đánh dấu giải quyết.")


@router.delete("/{reminder_id}", response_model=ReminderActionResponse)
async def delete_reminder(reminder_id: str):
    """
    Delete a reminder.
    """
    ok = ReminderTracker.delete_reminder(reminder_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Reminder not found.")
    return ReminderActionResponse(success=True, message=f"Đã xóa nhắc nhở {reminder_id}.")
