import re
from typing import List, Optional
from pydantic import BaseModel, Field

from packages.data.schemas.transaction import Transaction
from packages.data.schemas.email import EmailEvidence
from packages.evidence.confidence import compute_transaction_email_confidence


class EmailMatchResult(BaseModel):
    transaction_id: str
    transaction_amount: float
    transaction_merchant: str
    transaction_date: str
    transaction_source: str
    
    email_id: Optional[str] = None
    email_sender: Optional[str] = None
    email_subject: Optional[str] = None
    email_date: Optional[str] = None
    
    match_status: str  # "Có email khớp" | "Không tìm thấy email" | "Email nghi giả"
    confidence_score: float  # e.g. 0.96
    confidence_percentage: str  # "96%"
    confidence_label: str  # "Mức độ tin cậy cao"
    match_reason: str
    source_used: str


class EmailReconciliationEngine:
    """
    Reconciles Transactions with mailbox evidence.
    Produces canonical 4-column output:
    Transaction | Email | Kết quả | Confidence
    """

    @staticmethod
    def match_transactions_with_emails(
        transactions: List[Transaction],
        emails: List[EmailEvidence],
    ) -> List[EmailMatchResult]:
        results: List[EmailMatchResult] = []

        for tx in transactions:
            best_email: Optional[EmailEvidence] = None
            best_score: float = 0.0
            best_label: str = "Chưa đủ dữ liệu"

            for em in emails:
                score, label = compute_transaction_email_confidence(tx, em)
                if score > best_score:
                    best_score = score
                    best_label = label
                    best_email = em

            tx_date_str = tx.occurred_at.strftime("%d/%m/%Y")
            merchant_display = tx.merchant_normalized or tx.merchant_raw or "Chưa xác định"

            # Check if email is suspicious/fake (e.g. mismatched domain, forged ref, suspicious TLD)
            is_suspicious = False
            if best_email:
                sender_lower = best_email.sender.lower()
                subject_lower = best_email.subject.lower()
                merchant_lower = best_email.merchant.lower()

                if any(ext in sender_lower for ext in [".xyz", ".top", ".club", ".promo", "free-", "tempmail", "fake", "spoof", "-promo"]):
                    is_suspicious = True
                elif "paypal" in subject_lower and not ("paypal.com" in sender_lower or "service@paypal" in sender_lower):
                    is_suspicious = True
                elif "amazon" in subject_lower and not ("amazon.com" in sender_lower or "sellercentral" in sender_lower):
                    is_suspicious = True
                elif "stripe" in subject_lower and not ("stripe.com" in sender_lower):
                    is_suspicious = True
                elif "netflix" in merchant_lower and not ("netflix.com" in sender_lower):
                    is_suspicious = True

            merchant_matches = bool(
                best_email and tx.merchant_normalized and best_email.merchant and
                (tx.merchant_normalized.lower() in best_email.merchant.lower() or best_email.merchant.lower() in tx.merchant_normalized.lower())
            )

            if is_suspicious and best_email:
                match_status = "Email nghi giả"
                conf_pct = f"{int(max(best_score, 0.75) * 100)}%"
                reason = f"Email có tiêu đề/nội dung liên quan nhưng tên miền người gửi ({best_email.sender}) không khớp máy chủ xác thực chính thức."
                source_used = f"Mailbox ({best_email.sender})"
                email_id = best_email.id
                email_sender = best_email.sender
                email_subject = best_email.subject
                email_date = best_email.date.strftime("%d/%m/%Y")
            elif best_score >= 0.70 and best_email and merchant_matches:
                match_status = "Có email khớp"
                conf_pct = f"{int(best_score * 100)}%"
                reason = f"Khớp số tiền ${tx.amount:,.2f} và đơn vị thụ hưởng '{best_email.merchant}' trong vòng {abs((tx.occurred_at.date() - best_email.date.date()).days)} ngày."
                source_used = f"Mailbox ({best_email.sender})"
                email_id = best_email.id
                email_sender = best_email.sender
                email_subject = best_email.subject
                email_date = best_email.date.strftime("%d/%m/%Y")
            else:
                match_status = "Không tìm thấy email"
                conf_pct = f"{int(max(best_score, 0.25) * 100)}%"
                reason = "Không tìm thấy hoá đơn điện tử hoặc email biên lai giao dịch tương ứng trong hộp thư đối chiếu."
                source_used = "Không tìm thấy"
                email_id = None
                email_sender = "—"
                email_subject = "—"
                email_date = "—"


            results.append(
                EmailMatchResult(
                    transaction_id=tx.id,
                    transaction_amount=tx.amount,
                    transaction_merchant=merchant_display,
                    transaction_date=tx_date_str,
                    transaction_source=tx.source.value,
                    email_id=email_id,
                    email_sender=email_sender,
                    email_subject=email_subject,
                    email_date=email_date,
                    match_status=match_status,
                    confidence_score=best_score,
                    confidence_percentage=conf_pct,
                    confidence_label=best_label,
                    match_reason=reason,
                    source_used=source_used,
                )
            )

        return results
