import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from packages.data.schemas.alert import Alert, AlertType


class EmailNotificationLog(BaseModel):
    id: str = Field(..., description="Notification ID")
    recipient_email: str
    recipient_role: str = Field(default="user", description="user | ceo | support_team")
    subject: str
    alert_type: str
    severity: str = "HIGH"
    html_content: str
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = "sent"


class EmailAlertDispatcher:
    """
    Dispatches automated financial safety email alerts to Wealify Users, CEOs, and Support Teams.
    Generates branded, clean HTML notifications explaining the anomaly, evidence, and next steps.
    """

    _SENT_LOGS: List[EmailNotificationLog] = []

    @classmethod
    def generate_html_alert(
        cls,
        alert: Alert,
        user_name: str = "Quý khách hàng Wealify",
    ) -> str:
        color_theme = "#f43f5e" if alert.alert_type == AlertType.OVERDUE_PAYOUT else "#f59e0b"
        badge_label = "CẢNH BÁO KHẨN CẤP" if alert.alert_type == AlertType.OVERDUE_PAYOUT else "CẢNH BÁO BẤT THƯỜNG"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1); }}
            .header {{ display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px; }}
            .logo {{ font-size: 20px; font-weight: bold; color: #38bdf8; }}
            .badge {{ background: {color_theme}22; color: {color_theme}; border: 1px solid {color_theme}55; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; }}
            .title {{ font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #ffffff; }}
            .card {{ background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid rgba(255,255,255,0.05); }}
            .field {{ margin-bottom: 8px; font-size: 14px; color: #cbd5e1; }}
            .field strong {{ color: #ffffff; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #6366f1, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px; }}
            .footer {{ margin-top: 24px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🛡️ Wealify Guardian</div>
              <div class="badge">{badge_label}</div>
            </div>
            
            <div class="title">{alert.title}</div>
            <p style="font-size: 14px; color: #94a3b8; line-height: 1.5;">
              Kính gửi <strong>{user_name}</strong>,<br>
              Hệ thống giám sát giao dịch Wealify Guardian vừa phát hiện một bất thường tài chính cần bạn xác nhận:
            </p>
            
            <div class="card">
              <div class="field"><strong>📌 Chi tiết sự cố:</strong> {alert.reason}</div>
              <div class="field"><strong>💰 Số tiền liên quan:</strong> ${alert.amount:,.2f} USD</div>
              <div class="field"><strong>🔍 Mức độ tin cậy AI:</strong> {alert.confidence_label} ({alert.confidence*100:.0f}%)</div>
              <div class="field"><strong>⏳ Hạn tra soát ngân hàng:</strong> {alert.deadline_days} ngày</div>
              {f'<div class="field"><strong>💡 Đề xuất hành động:</strong> {alert.action_suggestion}</div>' if alert.action_suggestion else ''}
            </div>

            <p style="font-size: 13px; color: #94a3b8;">
              Bạn có thể mở ứng dụng Wealify hoặc hỏi trực tiếp <strong>AI Copilot</strong> để xem giải thích chi tiết và mẫu đơn khiếu nại đã soạn sẵn.
            </p>

            <a href="http://localhost:3000" class="button">Truy Cập Wealify Guardian Dashboard</a>

            <div class="footer">
              Email tự động từ Hệ thống An Toàn Giao Dịch Wealify Guardian.<br>
              Nếu cần hỗ trợ khẩn cấp, vui lòng liên hệ support@wealify.com
            </div>
          </div>
        </body>
        </html>
        """
        return html

    @classmethod
    def dispatch_alert(
        cls,
        alert: Alert,
        recipient_email: str = "customer@merchant-store.com",
        recipient_role: str = "user",
    ) -> EmailNotificationLog:
        html = cls.generate_html_alert(alert)
        log = EmailNotificationLog(
            id=f"notif_{uuid.uuid4().hex[:8]}",
            recipient_email=recipient_email,
            recipient_role=recipient_role,
            subject=f"[Wealify Cảnh Báo] {alert.title}",
            alert_type=alert.alert_type.value,
            severity="CRITICAL" if alert.alert_type == AlertType.OVERDUE_PAYOUT else "WARNING",
            html_content=html,
            sent_at=datetime.utcnow(),
            status="sent",
        )
        cls._SENT_LOGS.insert(0, log)
        return log

    @classmethod
    def list_sent_notifications(cls) -> List[EmailNotificationLog]:
        if not cls._SENT_LOGS:
            # Seed initial sample email notifications
            from packages.data.schemas.alert import AlertStatus
            sample_alert = Alert(
                id="alt_sample_01",
                alert_type=AlertType.OVERDUE_PAYOUT,
                title="⚠️ Bất thường Payout chưa về: Amazon Seller Central ($4,250.00)",
                status=AlertStatus.NEEDS_USER_CONFIRMATION,
                reason="Email xác nhận giải ngân $4,250.00 USD từ Amazon ngày 05/08/2026 nhưng sau 16 ngày chưa thấy tiền về tài khoản Wealify.",
                confidence=0.96,
                confidence_label="Mức độ tin cậy cao",
                amount=4250.00,
                deadline_days=60,
                action_suggestion="Gửi ticket tra soát tới sàn Amazon Seller Central.",
            )
            cls.dispatch_alert(sample_alert, "ceo@wealify-store.com", "user")

            sample_alert_2 = Alert(
                id="alt_sample_02",
                alert_type=AlertType.DUPLICATE,
                title="⚠️ Cà thẻ 2 lần: Facebook Ads ($150.00) trên thẻ ảo VPBank",
                status=AlertStatus.NEEDS_USER_CONFIRMATION,
                reason="Phát hiện 2 giao dịch cùng số tiền $150.00 USD tại Facebook Ads chỉ cách nhau 1 phút 45 giây.",
                confidence=0.98,
                confidence_label="Mức độ tin cậy cao",
                amount=150.00,
                deadline_days=59,
                action_suggestion="Yêu cầu ngân hàng VPBank tra soát hoàn lại tiền bị trừ thừa.",
            )
            cls.dispatch_alert(sample_alert_2, "finance@wealify-store.com", "user")

        return cls._SENT_LOGS
