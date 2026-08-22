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


class TestSMTPRequest(BaseModel):
    recipient_email: str = Field(default="founder@wealify.io", description="Recipient to receive test email")


class SendReportRequest(BaseModel):
    recipient_email: str = Field(default="founder@wealify.io", description="Recipient email for monthly report")
    period: str = Field(default="2026-08", description="Period to generate report for (e.g. 2026-08)")


@router.post("/test-smtp")
async def test_smtp_endpoint(req: TestSMTPRequest):
    """
    Tests the live SMTP connection and sends a sample test email to verify credentials.
    """
    subject = "[Wealify Guardian] Kiểm tra kết nối máy chủ Email SMTP thành công"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: sans-serif; background-color: #070b14; color: #ffffff; padding: 24px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #0d1322; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #fc6508; margin-top: 0;">Wealify Guardian SMTP Test</h2>
        <p style="color: #cbd5e1; font-size: 14px;">Xin chào,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Máy chủ email SMTP của bạn đã được kết nối và cấu hình thành công với hệ thống <strong>Wealify Guardian Copilot</strong>.</p>
        <div style="background-color: #131b2e; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #10b981;">
          ✓ SMTP Status: Active & Authenticated<br>
          ✓ Recipient: {req.recipient_email}
        </div>
        <p style="color: #64748b; font-size: 11px; margin-top: 20px;">Email tự động gửi từ Wealify Guardian.</p>
      </div>
    </body>
    </html>
    """
    res = EmailAlertDispatcher.send_smtp_email(
        to_email=req.recipient_email,
        subject=subject,
        html_body=html_body,
        text_body=f"Wealify Guardian SMTP Test Email to {req.recipient_email} succeeded.",
    )
    return res


@router.post("/send-report")
async def send_report_endpoint(req: SendReportRequest):
    """
    Generates and dispatches the full monthly financial report to the user's email via SMTP.
    """
    from packages.financial.calculations.metrics import FinancialCalculator
    txs = await tx_source.get_transactions()
    summary = FinancialCalculator.calculate_monthly_summary(transactions=txs, period=req.period)

    log = EmailAlertDispatcher.dispatch_report_email(
        summary_data=summary.model_dump(),
        recipient_email=req.recipient_email,
    )
    return {
        "success": True,
        "notification_id": log.id,
        "recipient": req.recipient_email,
        "subject": log.subject,
        "summary": log.summary,
    }


class SendForensicReportNotificationRequest(BaseModel):
    recipient_email: str = Field(default="founder@wealify.io", description="Recipient to receive forensic report")
    claimed_amount: float = Field(default=2500.0)
    reference: Optional[str] = Field(default=None)
    claimed_ref: Optional[str] = Field(default=None)
    conflict_score: int = Field(default=92)
    risk_level: Optional[str] = Field(default="HIGH")
    summary: Optional[str] = Field(default=None)
    dimensions: Optional[List[Dict[str, Any]]] = Field(default=None)


@router.post("/send-forensic-report")
async def send_forensic_report_notification_endpoint(req: SendForensicReportNotificationRequest):
    """
    Alias for /api/v1/security/send-forensic-report to dispatch forensic reports via SMTP.
    """
    ref_value = req.reference or req.claimed_ref or "WF-839291"
    forensic_data = {
        "claimed_amount": req.claimed_amount,
        "reference": ref_value,
        "conflict_score": req.conflict_score,
        "summary": req.summary or "Hệ thống đã đối soát toàn bộ sổ cái kế toán và hộp thư. Không tìm thấy lệnh chuyển tiền tương ứng với mã số giao dịch được cung cấp.",
        "dimensions": req.dimensions,
    }

    log = EmailAlertDispatcher.dispatch_forensic_report_email(
        forensic_data=forensic_data,
        recipient_email=req.recipient_email,
    )

    return {
        "success": True,
        "notification_id": log.id,
        "recipient": req.recipient_email,
        "subject": log.subject,
        "summary": log.summary,
    }
