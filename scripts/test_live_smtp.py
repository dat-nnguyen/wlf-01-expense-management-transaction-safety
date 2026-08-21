import os
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

# Load .env
load_dotenv()

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from packages.connectors.email_dispatcher import EmailAlertDispatcher

recipient = os.getenv("SMTP_USER", "masewtricker.contact.06@gmail.com")

print(f"=== STEP 1: Sending Test Verification Email to {recipient} ===")
res1 = EmailAlertDispatcher.send_smtp_email(
    to_email=recipient,
    subject="[Wealify Guardian] Xác nhận kết nối thành công SMTP Gmail",
    html_body="""
    <div style="font-family: sans-serif; background-color: #070b14; color: #fff; padding: 24px; border-radius: 12px;">
      <h2 style="color: #fc6508;">Wealify Guardian — SMTP Connected!</h2>
      <p style="color: #cbd5e1;">Xin chào,</p>
      <p style="color: #cbd5e1;">Máy chủ email Gmail SMTP của bạn đã được xác thực và hoạt động hoàn hảo.</p>
      <div style="background: #131b2e; padding: 12px; border-radius: 8px; color: #10b981; font-family: monospace;">
        ✓ SMTP Host: smtp.gmail.com:587 (STARTTLS)<br>
        ✓ Status: Active & Live<br>
        ✓ Sender: masewtricker.contact.06@gmail.com
      </div>
    </div>
    """,
    text_body="Wealify Guardian SMTP Connected successfully!",
)
print("Result 1:", res1)

print(f"\n=== STEP 2: Dispatching Full Financial Report HTML to {recipient} ===")
sample_summary = {
    "period": "2026-08",
    "total_expense": 3561.73,
    "total_income": 25108.35,
    "total_fees": 241.25,
    "internal_transfers": 5350.00,
    "total_income_vnd": 890366000.0,
    "top_3_expenses": [
        {"merchant_normalized": "Landlord Rent Transfer", "amount": 1200.0, "currency": "USD", "occurred_at": "2026-08-05"},
        {"merchant_normalized": "Google", "amount": 420.0, "currency": "USD", "occurred_at": "2026-08-10"},
        {"merchant_normalized": "Meta Facebook Ads", "amount": 400.0, "currency": "USD", "occurred_at": "2026-08-20"},
    ],
}
log = EmailAlertDispatcher.dispatch_report_email(sample_summary, recipient_email=recipient)
print("Dispatched Report Log ID:", log.id)
print("Subject:", log.subject)
print("Status:", log.status)
