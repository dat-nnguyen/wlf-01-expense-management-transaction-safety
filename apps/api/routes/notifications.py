from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field
from packages.connectors.email_dispatcher import EmailAlertDispatcher, EmailNotificationLog
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.reconciliation.payout_radar import PayoutRadar

router = APIRouter(prefix="/api/v1/notifications", tags=["Email Notifications"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()


class SendAlertRequest(BaseModel):
    alert_id: Optional[str] = Field(default=None)
    recipient_email: str = "founder@wealify.io"
    recipient_role: str = "user"


class ScanAndNotifyRequest(BaseModel):
    recipient_email: str = "founder@wealify.io"


@router.get("", response_model=List[EmailNotificationLog])
async def list_notifications():
    return EmailAlertDispatcher.list_sent_notifications()


@router.post("/scan-and-notify")
async def scan_and_notify_endpoint(req: ScanAndNotifyRequest):
    """
    Scans for:
    1. Virtual card double-swipes (same product/merchant at same time)
    2. Subscription price hikes
    3. Overdue e-commerce payouts (>14 days)
    And automatically dispatches formatted HTML email notifications to the user.
    """
    txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()

    dispatched_logs = EmailAlertDispatcher.auto_scan_and_notify(
        account_txs=txs,
        emails=emails,
        recipient_email=req.recipient_email,
    )

    all_logs = EmailAlertDispatcher.list_sent_notifications()
    return {
        "success": True,
        "newly_dispatched_count": len(dispatched_logs),
        "new_notifications": dispatched_logs,
        "total_sent_notifications": len(all_logs),
    }


@router.post("/send")
async def trigger_email_alert(req: SendAlertRequest):
    txs = await tx_source.get_transactions()
    emails = await em_source.get_emails()
    payout_alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=txs)

    target_alert = next((a for a in payout_alerts if a.id == req.alert_id), None)
    if not target_alert and payout_alerts:
        target_alert = payout_alerts[0]

    if target_alert:
        log = EmailAlertDispatcher.dispatch_alert(target_alert, req.recipient_email, req.recipient_role)
        return {"success": True, "notification": log}

    return {"success": False, "message": "No active alert to dispatch"}
