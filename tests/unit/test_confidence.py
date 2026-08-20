from datetime import datetime, timedelta
from packages.data.schemas.transaction import Transaction
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.evidence.confidence import compute_transaction_email_confidence


def test_confidence_perfect_match():
    now = datetime.utcnow()
    tx = Transaction(
        id="t1",
        occurred_at=now,
        amount=9.99,
        merchant_raw="Netflix.com",
        merchant_normalized="Netflix",
    )
    email = EmailEvidence(
        id="e1",
        date=now,
        sender="service@netflix.com",
        subject="Your Netflix Subscription Receipt",
        merchant="Netflix",
        amount=9.99,
        email_type=EmailType.RECEIPT,
    )

    score, label = compute_transaction_email_confidence(tx, email)
    assert score >= 0.85
    assert label == "Mức độ tin cậy cao"


def test_confidence_no_email():
    tx = Transaction(
        id="t1",
        occurred_at=datetime.utcnow(),
        amount=9.99,
        merchant_raw="Unknown Merchant",
        merchant_normalized="Unknown Merchant",
    )
    score, label = compute_transaction_email_confidence(tx, None)
    assert score == 0.0
    assert label == "Chưa đủ dữ liệu"
