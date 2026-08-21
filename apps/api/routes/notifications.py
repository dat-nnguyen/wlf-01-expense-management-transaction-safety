from typing import List
from fastapi import APIRouter
from pydantic import BaseModel
from packages.connectors.email_dispatcher import EmailAlertDispatcher, EmailNotificationLog
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.reconciliation.payout_radar import PayoutRadar

router = APIRouter(prefix="/api/v1/notifications", tags=["Email Notifications"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()


class SendAlertRequest(BaseModel):
    alert_id: str
    recipient_email: str = "customer@wealify-store.com"
    recipient_role: str = "user"


@router.get("", response_model=List[EmailNotificationLog])
async def list_notifications():
    return EmailAlertDispatcher.list_sent_notifications()


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
