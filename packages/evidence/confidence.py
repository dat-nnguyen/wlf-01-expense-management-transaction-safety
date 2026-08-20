from datetime import datetime
from typing import Optional, Tuple
from packages.data.schemas.transaction import Transaction
from packages.data.schemas.email import EmailEvidence


def compute_transaction_email_confidence(
    tx: Transaction,
    email: Optional[EmailEvidence],
) -> Tuple[float, str]:
    """
    Calculate deterministic confidence score between a transaction and an email evidence.
    Weights:
      - Amount match: 0.40
      - Date match (within 3 days): 0.25
      - Merchant name match: 0.25
      - Email semantic / subject match: 0.10
    """
    if not email:
        return 0.0, "Chưa đủ dữ liệu"

    score = 0.0

    # 1. Amount match (0.40)
    if email.amount is not None:
        diff = abs(tx.amount - email.amount)
        if diff < 0.01:
            score += 0.40
        elif diff < 1.00:
            score += 0.20

    # 2. Date proximity (0.25)
    days_diff = abs((tx.occurred_at.date() - email.date.date()).days)
    if days_diff == 0:
        score += 0.25
    elif days_diff <= 2:
        score += 0.18
    elif days_diff <= 5:
        score += 0.10

    # 3. Merchant match (0.25)
    m_tx = tx.merchant_normalized.lower().strip()
    m_em = email.merchant.lower().strip()
    if m_tx and m_em and (m_tx in m_em or m_em in m_tx):
        score += 0.25
    elif m_tx in email.sender.lower() or m_tx in email.subject.lower():
        score += 0.15

    # 4. Email semantics (0.10)
    if any(k in email.subject.lower() for k in ["receipt", "invoice", "payment", "subscription", "order", "charge"]):
        score += 0.10

    # Label assignment
    if score >= 0.80:
        label = "Mức độ tin cậy cao"
    elif score >= 0.50:
        label = "Mức độ tin cậy trung bình"
    else:
        label = "Mức độ tin cậy thấp"

    return round(score, 2), label


def get_confidence_label(score: float) -> str:
    if score >= 0.80:
        return "Mức độ tin cậy cao"
    elif score >= 0.50:
        return "Mức độ tin cậy trung bình"
    return "Mức độ tin cậy thấp"
