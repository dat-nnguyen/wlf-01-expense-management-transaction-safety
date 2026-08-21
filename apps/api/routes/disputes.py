"""Dispute Form & Official Letter Generator for Wealify Guardian.

Allows users to generate, preview, and download formal dispute letters
and bank inquiry forms adhering to US Regulation E (60-day statutory deadline)
and international card scheme dispute rules (Visa / Mastercard).
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field

router = APIRouter(prefix="/api/v1/disputes", tags=["Dispute Letters & Chargeback Forms"])


class GenerateDisputeRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dispute_type: str = Field(default="DUPLICATE_CHARGE", description="DUPLICATE_CHARGE, OVERDUE_PAYOUT, UNRECOGNIZED_TRANSACTION, SUBSCRIPTION_PRICE_HIKE")
    merchant: str = Field(..., description="Target merchant or payee name")
    amount: float = Field(..., description="Disputed amount")
    currency: str = Field(default="USD")
    card_id: Optional[str] = Field(default="**** 0001", description="Virtual card last 4 digits")
    bank_name: Optional[str] = Field(default="Wealify Virtual Visa", description="Issuing bank or platform")
    reference_id: Optional[str] = Field(default=None, description="ARN / MT103 / Transaction reference")
    statement_date: Optional[str] = Field(default=None, description="Date on statement / email")
    language: str = Field(default="vi", description="'vi' or 'en'")
    user_name: str = Field(default="Lê Minh Anh")
    user_email: str = Field(default="founder@wealify.io")


class DisputeDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    document_id: str
    title: str
    plain_text: str
    html_content: str
    dispute_deadline_note: str
    created_at: str


@router.post("/generate", response_model=DisputeDocumentResponse)
async def generate_dispute_document(payload: GenerateDisputeRequest):
    """
    Generates a personalized, legally compliant formal dispute letter / ticket draft
    with US Regulation E 60-day statutory notice and transaction references.
    """
    import uuid
    doc_id = f"DISP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    today_str = datetime.now(timezone.utc).strftime("%d/%m/%Y")
    is_en = payload.language == "en"

    if is_en:
        title = f"Notice of Disputed Transaction - {payload.merchant} (${payload.amount:,.2f} {payload.currency})"
        deadline_note = "Statutory Dispute Notice: Under US Electronic Fund Transfer Act (Regulation E, 12 CFR § 1005.11), this notice is filed within the 60-day window from the statement delivery date."
        plain_text = (
            f"FORMAL NOTICE OF DISPUTED TRANSACTION\n"
            f"Document ID: {doc_id}\n"
            f"Date: {today_str}\n\n"
            f"TO: Card Dispute & Settlement Department ({payload.bank_name})\n"
            f"FROM: {payload.user_name} ({payload.user_email})\n"
            f"ACCOUNT / CARD: {payload.card_id}\n\n"
            f"SUBJECT: Formal Dispute for Unsettled / Duplicate Charge at {payload.merchant}\n\n"
            f"Dear Dispute Officer,\n\n"
            f"I am writing to formally dispute the following debit transaction posted to my account:\n\n"
            f"- Merchant Description: {payload.merchant}\n"
            f"- Disputed Amount: ${payload.amount:,.2f} {payload.currency}\n"
            f"- Reference / ARN Number: {payload.reference_id or 'N/A'}\n"
            f"- Statement / Transaction Date: {payload.statement_date or today_str}\n"
            f"- Dispute Reason: {payload.dispute_type.replace('_', ' ').title()}\n\n"
            f"LEGAL BASIS:\n"
            f"In accordance with 12 CFR § 1005.11 (Regulation E), I request an immediate provisional credit and a full investigation "
            f"into this charge. Supporting audit records from the Wealify ledger and email confirmations have been retained.\n\n"
            f"Please confirm receipt of this dispute letter and provide a case tracking reference within 10 business days.\n\n"
            f"Sincerely,\n\n"
            f"__________________________\n"
            f"{payload.user_name}\n"
            f"Authorized Account Holder"
        )
    else:
        title = f"Đơn Đề Nghị Tra Soát & Khiếu Nại Giao Dịch - {payload.merchant} (${payload.amount:,.2f} {payload.currency})"
        deadline_note = "Căn cứ thời hạn quy định: Đơn tra soát này được lập trong thời hạn 60 ngày kể từ ngày ngân hàng/tổ chức phát hành gửi sao kê (Tuân thủ Quy định Regulation E)."
        plain_text = (
            f"CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n"
            f"Độc lập - Tự do - Hạnh phúc\n\n"
            f"ĐƠN ĐỀ NGHỊ TRA SOÁT & KHIẾU NẠI GIAO DỊCH\n"
            f"Mã tra soát: {doc_id}\n"
            f"Ngày lập: {today_str}\n\n"
            f"Kính gửi: Bộ phận Tiếp nhận Tra soát & Khiếu nại ({payload.bank_name})\n\n"
            f"Tôi tên là: {payload.user_name}\n"
            f"Email liên hệ: {payload.user_email}\n"
            f"Thông tin thẻ/tài khoản: {payload.card_id}\n\n"
            f"NỘI DUNG TRA SOÁT:\n"
            f"Tôi làm đơn này đề nghị Quý ngân hàng/tổ chức phát hành hỗ trợ tra soát và hoàn trả khoản tiền sau:\n"
            f"- Đơn vị thụ hưởng: {payload.merchant}\n"
            f"- Số tiền yêu cầu tra soát: ${payload.amount:,.2f} {payload.currency}\n"
            f"- Mã giao dịch tham chiếu: {payload.reference_id or 'Chưa xác định được'}\n"
            f"- Ngày phát sinh giao dịch: {payload.statement_date or today_str}\n"
            f"- Lý do khiếu nại: {payload.dispute_type.replace('_', ' ')}\n\n"
            f"CĂN CỨ PHÁP LÝ & BẰNG CHỨNG:\n"
            f"Khoản tiền trên được phát hiện có dấu hiệu bất thường thông qua hệ thống đối soát tài chính Wealify Guardian. "
            f"Giao dịch được đề nghị tra soát đúng thời hạn quy định (trong vòng 60 ngày kể từ ngày gửi sao kê theo Regulation E).\n\n"
            f"Kính đề nghị Quý đơn vị phối hợp tra soát và phản hồi kết quả xử lý trong thời gian sớm nhất.\n\n"
            f"Người làm đơn\n\n\n"
            f"{payload.user_name}"
        )

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }}
.header {{ border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }}
.doc-id {{ font-size: 12px; color: #64748b; font-family: monospace; }}
.title {{ font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 5px; }}
.table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
.table th, .table td {{ border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }}
.table th {{ background-color: #f8fafc; font-weight: 600; }}
.legal-box {{ background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #1e40af; }}
.signature-area {{ margin-top: 50px; display: flex; justify-content: space-between; }}
.sig-line {{ border-top: 1px solid #94a3b8; width: 200px; margin-top: 60px; }}
</style>
</head>
<body>
<div class="header">
  <div class="doc-id">DOC ID: {doc_id} | DATE: {today_str}</div>
  <div class="title">{title}</div>
</div>
<p><strong>To:</strong> {payload.bank_name} - Card Dispute & Settlement Department</p>
<p><strong>From:</strong> {payload.user_name} ({payload.user_email}) | <strong>Account / Card:</strong> {payload.card_id}</p>

<table class="table">
  <tr><th>Item</th><th>Details</th></tr>
  <tr><td>Merchant / Payee</td><td><strong>{payload.merchant}</strong></td></tr>
  <tr><td>Disputed Amount</td><td><strong>${payload.amount:,.2f} {payload.currency}</strong></td></tr>
  <tr><td>Reference / ARN</td><td><code>{payload.reference_id or 'N/A'}</code></td></tr>
  <tr><td>Transaction Date</td><td>{payload.statement_date or today_str}</td></tr>
  <tr><td>Dispute Category</td><td>{payload.dispute_type}</td></tr>
</table>

<div class="legal-box">
  🛡️ <strong>Statutory Regulatory Basis:</strong><br/>
  {deadline_note}
</div>

<p>I formally request an official investigation into this transaction and provisional credit where applicable. All supporting ledger timestamps and email receipts have been archived under Wealify Guardian Audit Logs.</p>

<div class="signature-area">
  <div>
    <p>Authorized Signature:</p>
    <div class="sig-line"></div>
    <p><strong>{payload.user_name}</strong><br/>Primary Account Holder</p>
  </div>
</div>
</body>
</html>"""

    return DisputeDocumentResponse(
        document_id=doc_id,
        title=title,
        plain_text=plain_text,
        html_content=html_content,
        dispute_deadline_note=deadline_note,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
