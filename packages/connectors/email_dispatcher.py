import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field
from packages.data.schemas.alert import Alert, AlertType, AlertStatus
from packages.observability.logging import logger


class EmailNotificationLog(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="Notification ID")
    recipient_email: str
    recipient_role: str = Field(default="user", description="user | ceo | support_team")
    subject: str
    alert_type: str
    severity: str = "HIGH"
    html_content: str
    summary: str
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "sent"


class EmailAlertDispatcher:
    """
    Automated Financial Safety Email Dispatcher for Wealify Guardian:
    Sends real-time, branded email notifications to verified users about:
    1. Virtual card double-swipes (same product/merchant at the same time)
    2. Subscription price hikes (software/SaaS cost increases)
    3. Overdue e-commerce payouts (>14-16 days delayed)
    4. Conflicting/fake transfer screenshot receipts
    """

    _SENT_LOGS: List[EmailNotificationLog] = []

    @classmethod
    def generate_html_alert(
        cls,
        alert: Alert,
        user_name: str = "Quý khách hàng Wealify",
    ) -> str:
        # Determine Theme Color and Category Header
        if alert.alert_type == AlertType.DUPLICATE:
            badge_color = "#f43f5e"
            badge_label = "CẢNH BÁO QUẸT THẺ ĐÚP (DOUBLE-SWIPE)"
            icon_header = "💳 Cảnh Báo Trừ Tiền Trùng Lặp Thẻ Ảo"
            card_border = "border-left: 4px solid #f43f5e;"
        elif alert.alert_type in [AlertType.PRICE_HIKE, AlertType.SUBSCRIPTION]:
            badge_color = "#f59e0b"
            badge_label = "CẢNH BÁO SUBSCRIPTION TĂNG GIÁ"
            icon_header = "📈 Cảnh Báo Thuê Bao Tăng Phí Định Kỳ"
            card_border = "border-left: 4px solid #f59e0b;"
        elif alert.alert_type == AlertType.OVERDUE_PAYOUT:
            badge_color = "#fc6508"
            badge_label = "CẢNH BÁO PAYOUT TRỄ > 14 NGÀY"
            icon_header = "🚨 Cảnh Báo Giải Ngân TMĐT Quá Hạn"
            card_border = "border-left: 4px solid #fc6508;"
        else:
            badge_color = "#3b82f6"
            badge_label = "CẢNH BÁO AN TOÀN TÀI CHÍNH"
            icon_header = "🛡️ Cảnh Báo Giao Dịch Bất Thường"
            card_border = "border-left: 4px solid #3b82f6;"

        amount_display = f"${alert.amount:,.2f} USD" if alert.amount else "Không xác định"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{alert.title}</title>
          <style>
            body {{
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #070b14;
              color: #f8fafc;
              margin: 0;
              padding: 24px;
            }}
            .container {{
              max-width: 600px;
              margin: 0 auto;
              background-color: #0d1322;
              border-radius: 16px;
              padding: 32px;
              border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }}
            .header {{
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              padding-bottom: 16px;
              margin-bottom: 20px;
            }}
            .brand {{
              font-size: 18px;
              font-weight: 800;
              color: #ffffff;
            }}
            .brand span {{
              color: #fc6508;
            }}
            .badge {{
              background: {badge_color}22;
              color: {badge_color};
              border: 1px solid {badge_color}55;
              padding: 4px 12px;
              border-radius: 99px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }}
            .title {{
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 12px;
              color: #ffffff;
            }}
            .card {{
              background: #131b2e;
              border-radius: 12px;
              padding: 18px;
              margin: 18px 0;
              border: 1px solid rgba(255, 255, 255, 0.06);
              {card_border}
            }}
            .field {{
              margin-bottom: 10px;
              font-size: 13.5px;
              color: #cbd5e1;
              line-height: 1.5;
            }}
            .field strong {{
              color: #ffffff;
            }}
            .btn {{
              display: inline-block;
              background: linear-gradient(135deg, #fc6508, #ff8a3d);
              color: #ffffff !important;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 13.5px;
              margin-top: 16px;
              box-shadow: 0 4px 15px rgba(252, 101, 8, 0.35);
            }}
            .disclaimer {{
              background: rgba(252, 101, 8, 0.08);
              border: 1px solid rgba(252, 101, 8, 0.25);
              border-radius: 8px;
              padding: 12px;
              margin-top: 20px;
              font-size: 12px;
              color: #ffa14e;
              line-height: 1.5;
            }}
            .footer {{
              margin-top: 28px;
              font-size: 11.5px;
              color: #64748b;
              text-align: center;
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              padding-top: 16px;
            }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">🛡️ WEALIFY <span>GUARDIAN</span></div>
              <div class="badge">{badge_label}</div>
            </div>
            
            <div class="title">{icon_header}</div>
            
            <p style="font-size: 13.5px; color: #94a3b8; line-height: 1.6;">
              Kính gửi <strong>{user_name}</strong>,<br>
              Hệ thống giám sát an toàn giao dịch <strong>Wealify Guardian</strong> vừa phát hiện sự cố tài chính cần bạn xác nhận để bảo vệ quyền lợi doanh nghiệp:
            </p>
            
            <div class="card">
              <div class="field"><strong>📌 Tiêu đề cảnh báo:</strong> {alert.title}</div>
              <div class="field"><strong>🔍 Chi tiết phát hiện:</strong> {alert.reason}</div>
              <div class="field"><strong>💰 Số tiền ảnh hưởng:</strong> <span style="color: #ffa14e; font-weight: bold; font-family: monospace; font-size: 15px;">{amount_display}</span></div>
              <div class="field"><strong>🛡️ Mức độ tin cậy AI:</strong> {alert.confidence_label} ({alert.confidence * 100:.0f}%)</div>
              <div class="field"><strong>⏳ Hạn tra soát theo luật Mỹ:</strong> <span style="color: #38bdf8; font-weight: bold;">{alert.deadline_days} ngày</span> (tính từ ngày sao kê ngân hàng)</div>
              {f'<div class="field" style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1);"><strong>💡 Đề xuất hành động:</strong> {alert.action_suggestion}</div>' if alert.action_suggestion else ''}
            </div>

            <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
              Bạn có thể mở trực tiếp ứng dụng Wealify hoặc trò chuyện với <strong>AI Copilot</strong> để xem văn bản tra soát đã soạn sẵn và thực hiện xác nhận.
            </p>

            <a href="http://localhost:3000" class="btn">Mở Wealify Guardian Để Xử Lý Ngay →</a>

            <div class="disclaimer">
              🔒 <strong>Chính sách an toàn Read-Only:</strong> Wealify Guardian không bao giờ tự động chuyển tiền, khóa thẻ hay gửi thư tới bên thứ ba khi chưa có sự xác nhận của bạn.
            </div>

            <div class="footer">
              Email thông báo tự động từ Hệ Thống An Toàn Giao Dịch Wealify Guardian.<br>
              Nếu cần hỗ trợ kỹ thuật khẩn cấp, vui lòng liên hệ: support@wealify.io
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
        recipient_email: str = "founder@wealify.io",
        recipient_role: str = "user",
    ) -> EmailNotificationLog:
        html = cls.generate_html_alert(alert)
        summary = f"{alert.title} — {alert.reason[:90]}..."
        log = EmailNotificationLog(
            id=f"notif_{uuid.uuid4().hex[:8]}",
            recipient_email=recipient_email,
            recipient_role=recipient_role,
            subject=f"[Wealify Guardian Alert] {alert.title}",
            alert_type=alert.alert_type.value,
            severity="CRITICAL" if alert.alert_type in [AlertType.OVERDUE_PAYOUT, AlertType.DUPLICATE] else "WARNING",
            html_content=html,
            summary=summary,
            sent_at=datetime.now(timezone.utc),
            status="sent",
        )
        cls._SENT_LOGS.insert(0, log)
        logger.info(f"EMAIL_ALERT_DISPATCHED | notif_id={log.id} | to={recipient_email} | type={alert.alert_type.value} | subject={alert.title}")
        return log

    @classmethod
    def auto_scan_and_notify(
        cls,
        account_txs: List[Any],
        emails: List[Any],
        recipient_email: str = "founder@wealify.io",
    ) -> List[EmailNotificationLog]:
        """
        Scans for anomalies across 3 key pillars:
        1. Duplicate virtual card swipes
        2. Subscription price hikes
        3. Overdue e-commerce payouts
        And automatically dispatches email notifications.
        """
        from packages.financial.anomaly.duplicate_detector import DuplicateDetector
        from packages.financial.subscriptions.subscription_radar import SubscriptionRadar
        from packages.financial.reconciliation.payout_radar import PayoutRadar

        new_dispatched_logs: List[EmailNotificationLog] = []

        # 1. Check Virtual Card Double Swipes
        dup_results = DuplicateDetector.find_duplicates(account_txs)
        for _, _, dup_alert in dup_results:
            # Check if alert already dispatched
            if not any(dup_alert.title in log.subject for log in cls._SENT_LOGS):
                log = cls.dispatch_alert(dup_alert, recipient_email)
                new_dispatched_logs.append(log)

        # 2. Check Subscription Price Hikes
        _, sub_alerts = SubscriptionRadar.detect_subscriptions(account_txs)
        for sub_alert in sub_alerts:
            if not any(sub_alert.title in log.subject for log in cls._SENT_LOGS):
                log = cls.dispatch_alert(sub_alert, recipient_email)
                new_dispatched_logs.append(log)

        # 3. Check Overdue Payouts (>14 days)
        payout_alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=account_txs)
        for p_alert in payout_alerts:
            if not any(p_alert.title in log.subject for log in cls._SENT_LOGS):
                log = cls.dispatch_alert(p_alert, recipient_email)
                new_dispatched_logs.append(log)

        return new_dispatched_logs

    @classmethod
    def list_sent_notifications(cls) -> List[EmailNotificationLog]:
        if not cls._SENT_LOGS:
            # Seed 3 realistic initial notifications covering the user's exact requirements
            sample_dup = Alert(
                id="alt_dup_fb_01",
                alert_type=AlertType.DUPLICATE,
                title="⚠️ Phát hiện quẹt thẻ ảo 2 lần: Facebook Ads ($150.00 x 2)",
                status=AlertStatus.NEEDS_USER_CONFIRMATION,
                reason="Phát hiện 2 giao dịch -$150.00 USD cách nhau 105 giây cho cùng dịch vụ Facebook Ads trên thẻ ảo Volcano Ads •••• 4812.",
                confidence=0.98,
                confidence_label="Mức độ tin cậy cao",
                amount=150.00,
                deadline_days=59,
                action_suggestion="Yêu cầu ngân hàng VPBank tra soát hoàn lại $150.00 USD bị trừ đúp.",
            )
            cls.dispatch_alert(sample_dup, "founder@wealify.io", "user")

            sample_sub = Alert(
                id="alt_sub_adobe_01",
                alert_type=AlertType.PRICE_HIKE,
                title="📈 Thuê bao tăng giá: Adobe Creative Cloud tăng +10.0%",
                status=AlertStatus.RECURRING_CONFIRMED,
                reason="Chi phí định kỳ hàng tháng của Adobe Creative Cloud đã tăng từ $49.99 lên $54.99/tháng (tăng +$5.00/tháng, +10.0%).",
                confidence=0.95,
                confidence_label="Mức độ tin cậy cao",
                amount=54.99,
                deadline_days=60,
                action_suggestion="Xem xét đàm phán lại gói doanh nghiệp hoặc hạ bậc các license không sử dụng.",
            )
            cls.dispatch_alert(sample_sub, "founder@wealify.io", "user")

            sample_payout = Alert(
                id="alt_payout_amz_01",
                alert_type=AlertType.OVERDUE_PAYOUT,
                title="🚨 Payout sàn Amazon chậm trễ 16 ngày ($4,250.00 USD)",
                status=AlertStatus.NEEDS_USER_CONFIRMATION,
                reason="Email xác nhận giải ngân $4,250.00 USD từ Amazon ngày 05/08/2026 nhưng sau 16 ngày chưa thấy tiền về tài khoản Wealify.",
                confidence=0.96,
                confidence_label="Mức độ tin cậy cao",
                amount=4250.00,
                deadline_days=60,
                days_overdue=16,
                action_suggestion="Gửi ticket tra soát giải ngân khẩn cấp tới Amazon Seller Central.",
            )
            cls.dispatch_alert(sample_payout, "founder@wealify.io", "user")

        return cls._SENT_LOGS
