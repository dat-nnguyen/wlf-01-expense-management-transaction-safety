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

        # Real SMTP Delivery if credentials configured in .env
        cls.send_smtp_email(
            to_email=recipient_email,
            subject=log.subject,
            html_body=html,
            text_body=f"{alert.title}\n\n{alert.reason}\n\nSố tiền: ${alert.amount:,.2f} USD\nHạn xử lý: {alert.deadline_days} ngày",
        )

        return log

    @classmethod
    def send_smtp_email(
        cls,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Universal SMTP Email Sender:
        Supports Gmail, Outlook, AWS SES, SendGrid, Mailgun, or any standard SMTP server.
        Configurable via .env:
          SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_NAME, SMTP_USE_SSL
        """
        import os
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        smtp_host = os.getenv("SMTP_HOST", "").strip()
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER", "").strip()
        smtp_pass = os.getenv("SMTP_PASSWORD", "").strip()
        if "gmail" in smtp_host.lower():
            smtp_pass = smtp_pass.replace(" ", "")
        smtp_from_name = os.getenv("SMTP_FROM_NAME", "Wealify Guardian Copilot").strip()
        smtp_use_ssl = os.getenv("SMTP_USE_SSL", "false").lower() in ["true", "1", "yes"]

        # Check if SMTP is configured
        if not smtp_host or not smtp_user or not smtp_pass or smtp_user.startswith("your_"):
            logger.info(f"SMTP_MOCK_MODE | No live SMTP credentials. Logged email to {to_email} locally.")
            return {
                "success": True,
                "mode": "mock_logged",
                "message": f"Email logged to in-memory audit log for {to_email} (configure SMTP in .env for live sending).",
                "recipient": to_email,
            }

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{smtp_from_name} <{smtp_user}>"
            msg["To"] = to_email

            if text_body:
                msg.attach(MIMEText(text_body, "plain", "utf-8"))
            msg.attach(MIMEText(html_body, "html", "utf-8"))

            if smtp_use_ssl or smtp_port == 465:
                # SSL Connection (port 465)
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12.0) as server:
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, [to_email], msg.as_string())
            else:
                # STARTTLS Connection (port 587 or 25)
                with smtplib.SMTP(smtp_host, smtp_port, timeout=12.0) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, [to_email], msg.as_string())

            logger.info(f"REAL_SMTP_SUCCESS | Sent live email to {to_email} via {smtp_host}:{smtp_port}")
            return {
                "success": True,
                "mode": "live_smtp",
                "message": f"Live email successfully sent to {to_email} via {smtp_host}:{smtp_port}",
                "recipient": to_email,
            }
        except Exception as e:
            logger.warning(f"REAL_SMTP_FAILED | Failed sending to {to_email}: {e}")
            return {
                "success": False,
                "mode": "live_smtp_failed",
                "error": str(e),
                "message": f"Failed to send email to {to_email}: {e}",
                "recipient": to_email,
            }

    @classmethod
    def generate_html_report(
        cls,
        summary_data: Dict[str, Any],
        user_name: str = "Quý khách hàng Wealify",
    ) -> str:
        """Generates a professional Fintech HTML Email for Monthly/Weekly Financial Reports."""
        period = summary_data.get("period", "2026-08")
        total_exp = summary_data.get("total_expense", 3561.73)
        total_income = summary_data.get("total_income", 25108.35)
        total_fees = summary_data.get("total_fees", 241.25)
        internal_transfers = summary_data.get("internal_transfers", 5350.00)
        vnd_income = summary_data.get("total_income_vnd", 890366000.0)
        top_3 = summary_data.get("top_3_expenses", [])

        top_3_rows = ""
        for idx, item in enumerate(top_3, 1):
            merchant = item.get("merchant_normalized") or item.get("merchant_raw") or item.get("merchant") or "Khoản chi"
            amt = item.get("amount", 0)
            curr = item.get("currency", "USD")
            date_str = str(item.get("occurred_at") or item.get("date") or "")[:10]
            top_3_rows += f"""
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #f8fafc;">
                <strong>{idx}. {merchant}</strong>
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #cbd5e1; font-family: monospace;">
                {date_str}
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #f43f5e; font-weight: bold; font-family: monospace; text-align: right;">
                ${amt:,.2f} {curr}
              </td>
            </tr>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Báo Cáo Thu Chi Kỳ {period} — Wealify Guardian</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070b14; color: #f8fafc; margin: 0; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #0d1322; border-radius: 16px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1);">
            
            <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px; margin-bottom: 24px;">
              <div style="font-size: 20px; font-weight: 800; color: #fc6508;">WEALIFY GUARDIAN</div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Báo Cáo Đối Soát Tài Chính & An Toàn Giao Dịch</div>
            </div>

            <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
              Kính gửi {user_name},
            </div>
            <div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
              Dưới đây là báo cáo tổng hợp thu chi và tình hình dòng tiền của doanh nghiệp trong kỳ <strong>{period}</strong> được trích xuất tự động từ sổ cái Wealify:
            </div>

            <!-- Metrics Summary Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
              <div style="background-color: #131b2e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Chi Phí Kinh Doanh Thực Tế</div>
                <div style="font-size: 20px; font-weight: 800; color: #f43f5e; font-family: monospace; margin-top: 6px;">${total_exp:,.2f} USD</div>
              </div>
              <div style="background-color: #131b2e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px;">
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600;">Doanh Thu / Tiền Vào (USD)</div>
                <div style="font-size: 20px; font-weight: 800; color: #10b981; font-family: monospace; margin-top: 6px;">${total_income:,.2f} USD</div>
              </div>
            </div>

            <div style="background-color: #131b2e; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <div style="font-size: 12px; color: #cbd5e1; line-height: 1.8;">
                • <strong>Chuyển tiền / Nạp ví nội bộ:</strong> <span style="color: #38bdf8; font-family: monospace;">${internal_transfers:,.2f} USD</span><br>
                • <strong>Tổng phí dịch vụ & FX:</strong> <span style="color: #f59e0b; font-family: monospace;">${total_fees:,.2f} USD</span><br>
                • <strong>Tiền vào tài khoản nội địa (VND):</strong> <span style="color: #10b981; font-family: monospace;">{vnd_income:,.0f} VND</span> <em>(~${vnd_income/25000:,.2f} USD)</em>
              </div>
            </div>

            <!-- Top 3 Expenses -->
            <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 12px;">3 Khoản Chi Phí Lớn Nhất Trong Kỳ:</div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #131b2e; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <thead>
                <tr style="background-color: #1a243b; text-align: left;">
                  <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Khoản chi</th>
                  <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Ngày</th>
                  <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase; text-align: right;">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {top_3_rows}
              </tbody>
            </table>

            <!-- Legal Disclaimer Footer -->
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; font-size: 11px; color: #64748b; line-height: 1.6;">
              🛡️ <em>Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify và không thay cho việc bạn tự kiểm tra. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — ở Mỹ thời hạn khiếu nại theo quy định là 60 ngày kể từ ngày ngân hàng gửi sao kê.</em>
            </div>

          </div>
        </body>
        </html>
        """
        return html

    @classmethod
    def generate_html_forensic_report(
        cls,
        forensic_data: Dict[str, Any],
        user_name: str = "Quý khách hàng Wealify",
    ) -> str:
        """Generates a professional Forensic Investigation Report HTML email for evidence verification."""
        claimed_amount = forensic_data.get("claimed_amount", 2500.0)
        reference = forensic_data.get("reference", "WF-839291")
        conflict_score = forensic_data.get("conflict_score", 92)
        risk_level = "NGUY CƠ CAO (HIGH RISK)" if conflict_score > 50 else "HỢP LỆ (VERIFIED)"
        score_color = "#f43f5e" if conflict_score > 50 else "#10b981"
        summary = forensic_data.get(
            "summary",
            "Hệ thống đã đối soát toàn bộ sổ cái kế toán và hộp thư. Không tìm thấy lệnh chuyển tiền tương ứng với mã số giao dịch được cung cấp. Khuyến nghị bạn không thực hiện bàn giao dịch vụ/hàng hoá trước khi tiền thực tế vào tài khoản.",
        )
        dimensions = forensic_data.get("dimensions", [
            {"name": "Mã tham chiếu (Reference)", "matched": False, "detail": f"Mã '{reference}' không tồn tại trong hệ thống sổ cái Wealify Core Banking."},
            {"name": "Số tiền & Sổ cái (Ledger)", "matched": False, "detail": f"Không có biến động số dư +${claimed_amount:,.2f} USD vào ngày giao dịch."},
            {"name": "Ví điện tử (Wallet)", "matched": False, "detail": "Không có giao dịch nạp tiền hoặc nhận chuyển khoản tương ứng."},
            {"name": "Hộp thư xác nhận (Email)", "matched": False, "detail": "Không có thông báo xác nhận chuyển khoản từ ngân hàng gửi về email."},
        ])

        dim_rows = ""
        for dim in dimensions:
            icon = "✓" if dim.get("matched") else "✗"
            color = "#10b981" if dim.get("matched") else "#f43f5e"
            status_txt = "KHỚP" if dim.get("matched") else "KHÔNG KHỚP"
            dim_rows += f"""
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="padding: 12px; font-size: 13px; color: #f8fafc; font-weight: 600;">
                <span style="color: {color}; font-weight: bold; margin-right: 6px;">[{icon}]</span>
                {dim.get('name')}
              </td>
              <td style="padding: 12px; font-size: 12px; color: {color}; font-weight: bold; font-family: monospace;">
                {status_txt}
              </td>
              <td style="padding: 12px; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                {dim.get('detail')}
              </td>
            </tr>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Báo Cáo Giám Định Bằng Chứng Giao Dịch — Wealify Guardian</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070b14; color: #f8fafc; margin: 0; padding: 24px;">
          <div style="max-width: 650px; margin: 0 auto; background-color: #0d1322; border-radius: 16px; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1);">
            
            <!-- Header -->
            <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 16px; margin-bottom: 24px;">
              <div style="font-size: 20px; font-weight: 800; color: #fc6508;">WEALIFY GUARDIAN</div>
              <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Trung Tâm Giám Định Bằng Chứng & Phòng Chống Gian Lận Tài Chính</div>
            </div>

            <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
              Kính gửi {user_name},
            </div>
            <div style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
              Hệ thống Wealify Guardian đã hoàn tất phiên giám định kỹ thuật số chuyên sâu đối với bằng chứng giao dịch (ảnh chụp biên lai/chứng từ chuyển tiền) được yêu cầu tra soát:
            </div>

            <!-- Risk Banner -->
            <div style="background-color: #131b2e; border: 2px solid {score_color}; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Chỉ Số Bất Thường / Xung Đột</div>
                <div style="font-size: 28px; font-weight: 900; color: {score_color}; font-family: monospace; margin-top: 4px;">{conflict_score}/100</div>
                <div style="font-size: 13px; color: {score_color}; font-weight: bold; margin-top: 4px;">Mức độ: {risk_level}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 12px; color: #94a3b8;">Số tiền khiếu nại:</div>
                <div style="font-size: 20px; font-weight: bold; color: #ffffff; font-family: monospace;">${claimed_amount:,.2f} USD</div>
                <div style="font-size: 12px; color: #38bdf8; font-family: monospace; margin-top: 4px;">Mã GD: {reference}</div>
              </div>
            </div>

            <!-- 4-Way Cross Check Table -->
            <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 12px;">Kết Quả Đối Soát Chéo 4 Chiều (4-Way Forensic Cross-Check):</div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #131b2e; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
              <thead>
                <tr style="background-color: #1a243b; text-align: left;">
                  <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Chiều Đối Soát</th>
                  <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Trạng Thái</th>
                  <th style="padding: 10px 12px; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Chi Tiết Xác Thực</th>
                </tr>
              </thead>
              <tbody>
                {dim_rows}
              </tbody>
            </table>

            <!-- AI Forensic Summary -->
            <div style="font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 8px;">Kết Luận Giám Định Wealify Guardian:</div>
            <div style="background-color: #131b2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #cbd5e1; line-height: 1.7;">
              {summary}
            </div>

            <!-- Legal Disclaimer Footer -->
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; font-size: 11px; color: #64748b; line-height: 1.6;">
              🛡️ <em>Công cụ này chỉ hỗ trợ bạn rà soát tài chính. Kết quả để tham khảo, không phải kết luận chính thức của Wealify và không thay cho việc bạn tự kiểm tra. Nếu thấy giao dịch lạ, hãy liên hệ hỗ trợ ngay — ở Mỹ thời hạn khiếu nại theo quy định là 60 ngày kể từ ngày ngân hàng gửi sao kê.</em>
            </div>

          </div>
        </body>
        </html>
        """
        return html

    @classmethod
    def dispatch_forensic_report_email(
        cls,
        forensic_data: Dict[str, Any],
        recipient_email: str = "founder@wealify.io",
        user_name: str = "Quý khách hàng Wealify",
    ) -> EmailNotificationLog:
        """Dispatches structured forensic investigation report email via SMTP."""
        claimed_amount = forensic_data.get("claimed_amount", 2500.0)
        reference = forensic_data.get("reference", "WF-839291")
        conflict_score = forensic_data.get("conflict_score", 92)
        html = cls.generate_html_forensic_report(forensic_data, user_name)
        subject = f"[Wealify Guardian] Báo Cáo Giám Định Bằng Chứng Giao Dịch — Mã {reference} (${claimed_amount:,.2f} USD)"

        log = EmailNotificationLog(
            id=f"for_{uuid.uuid4().hex[:8]}",
            recipient_email=recipient_email,
            recipient_role="user",
            subject=subject,
            alert_type="FORENSIC_INVESTIGATION",
            severity="CRITICAL" if conflict_score > 50 else "INFO",
            html_content=html,
            summary=f"Kết quả giám định bằng chứng mã {reference}: Điểm xung đột {conflict_score}/100 — {forensic_data.get('summary', '')[:80]}...",
            sent_at=datetime.now(timezone.utc),
            status="sent",
        )
        cls._SENT_LOGS.insert(0, log)
        logger.info(f"FORENSIC_REPORT_EMAIL_DISPATCHED | notif_id={log.id} | to={recipient_email} | ref={reference}")

        # Send via live SMTP
        cls.send_smtp_email(
            to_email=recipient_email,
            subject=subject,
            html_body=html,
            text_body=f"Báo Cáo Giám Định Bằng Chứng Giao Dịch\nMã tham chiếu: {reference}\nSố tiền khiếu nại: ${claimed_amount:,.2f} USD\nĐiểm xung đột: {conflict_score}/100\n\n{forensic_data.get('summary', '')}",
        )

        return log

    @classmethod
    def dispatch_report_email(
        cls,
        summary_data: Dict[str, Any],
        recipient_email: str = "founder@wealify.io",
        user_name: str = "Quý khách hàng Wealify",
    ) -> EmailNotificationLog:
        """Dispatches formatted financial summary report email."""
        period = summary_data.get("period", "2026-08")
        html = cls.generate_html_report(summary_data, user_name)
        subject = f"[Wealify Guardian] Báo Cáo Thu Chi & Đối Soát Tài Chính Kỳ {period}"

        log = EmailNotificationLog(
            id=f"rep_{uuid.uuid4().hex[:8]}",
            recipient_email=recipient_email,
            recipient_role="user",
            subject=subject,
            alert_type="FINANCIAL_REPORT",
            severity="INFO",
            html_content=html,
            summary=f"Báo cáo thu chi kỳ {period} — Chi phí kinh doanh: ${summary_data.get('total_expense', 3561.73):,.2f} USD",
            sent_at=datetime.now(timezone.utc),
            status="sent",
        )
        cls._SENT_LOGS.insert(0, log)
        logger.info(f"FINANCIAL_REPORT_EMAIL_DISPATCHED | notif_id={log.id} | to={recipient_email} | period={period}")

        # Send via live SMTP
        cls.send_smtp_email(
            to_email=recipient_email,
            subject=subject,
            html_body=html,
            text_body=f"Báo Cáo Thu Chi Kỳ {period}\nChi phí kinh doanh thực tế: ${summary_data.get('total_expense', 3561.73):,.2f} USD\nDoanh thu: ${summary_data.get('total_income', 25108.35):,.2f} USD",
        )

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
