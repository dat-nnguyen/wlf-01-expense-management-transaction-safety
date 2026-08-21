import pytest
from datetime import datetime, timezone
from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionSource, TransactionType
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.financial.reconciliation.reconciler import ReconciliationEngine
from packages.financial.reconciliation.email_reconciler import EmailReconciliationEngine


def test_3way_reconciliation_rules():
    account_txs = [
        Transaction(
            id="acc_01",
            account_id="acc_main",
            source=TransactionSource.ACCOUNT,
            transaction_type=TransactionType.PAYIN,
            amount=4250.0,
            currency="USD",
            direction=TransactionDirection.CREDIT,
            merchant_raw="Amazon Disbursement",
            merchant_normalized="Amazon",
            occurred_at=datetime(2026, 8, 5, tzinfo=timezone.utc),
        ),
        Transaction(
            id="acc_02",
            account_id="acc_main",
            source=TransactionSource.ACCOUNT,
            transaction_type=TransactionType.TRANSFER_TO_CARD,
            amount=50.0,
            currency="USD",
            direction=TransactionDirection.DEBIT,
            merchant_raw="Topup to Card 4812",
            merchant_normalized="Wealify Card",
            occurred_at=datetime(2026, 8, 10, tzinfo=timezone.utc),
        ),
    ]

    card_txs = [
        Transaction(
            id="card_01",
            account_id="acc_main",
            source=TransactionSource.CARD,
            transaction_type=TransactionType.CARD_PURCHASE,
            amount=150.0,
            currency="USD",
            direction=TransactionDirection.DEBIT,
            merchant_raw="Facebook Ads",
            merchant_normalized="Facebook Ads",
            occurred_at=datetime(2026, 8, 19, tzinfo=timezone.utc),
        ),
    ]

    wallet_txs = [
        Transaction(
            id="wal_01",
            account_id="acc_main",
            source=TransactionSource.WALLET,
            transaction_type=TransactionType.TRANSFER_TO_CARD,
            amount=500.0,
            currency="USD",
            direction=TransactionDirection.CREDIT,
            merchant_raw="Wallet Topup",
            merchant_normalized="Wealify Wallet",
            occurred_at=datetime(2026, 8, 12, tzinfo=timezone.utc),
        ),
        Transaction(
            id="wal_02",
            account_id="acc_main",
            source=TransactionSource.WALLET,
            transaction_type=TransactionType.TRANSFER_TO_CARD,
            amount=500.0,
            currency="USD",
            direction=TransactionDirection.CREDIT,
            merchant_raw="Wallet Topup Duplicate",
            merchant_normalized="Wealify Wallet",
            occurred_at=datetime(2026, 8, 12, tzinfo=timezone.utc),
        ),
    ]

    report = ReconciliationEngine.perform_3way_reconciliation(
        account_txs=account_txs,
        wallet_txs=wallet_txs,
        card_txs=card_txs,
        emails=[],
        account_balance_claimed=4200.0,
        wallet_balance_claimed=1000.0,
    )

    assert len(report.discrepancies) > 0
    # Rule check: Must not guess cause
    for disc in report.discrepancies:
        assert "chưa xác định nguyên nhân" in disc.explanation


def test_email_reconciliation_matching():
    txs = [
        Transaction(
            id="tx_netflix",
            account_id="acc_main",
            source=TransactionSource.CARD,
            transaction_type=TransactionType.SUBSCRIPTION,
            amount=15.49,
            currency="USD",
            direction=TransactionDirection.DEBIT,
            merchant_raw="Netflix.com",
            merchant_normalized="Netflix",
            occurred_at=datetime(2026, 8, 15, tzinfo=timezone.utc),
        ),
        Transaction(
            id="tx_ghost",
            account_id="acc_main",
            source=TransactionSource.CARD,
            transaction_type=TransactionType.CARD_PURCHASE,
            amount=99.0,
            currency="USD",
            direction=TransactionDirection.DEBIT,
            merchant_raw="Unknown Merchant",
            merchant_normalized="Unknown Merchant",
            occurred_at=datetime(2026, 8, 16, tzinfo=timezone.utc),
        ),
    ]

    emails = [
        EmailEvidence(
            id="em_01",
            date=datetime(2026, 8, 15, tzinfo=timezone.utc),
            sender="info@mailer.netflix.com",
            subject="Your Netflix Receipt for August 2026 ($15.49)",
            merchant="Netflix",
            amount=15.49,
            currency="USD",
            body_snippet="Your payment of $15.49 USD was processed.",
            email_type=EmailType.RECEIPT,
        ),
        EmailEvidence(
            id="em_fake",
            date=datetime(2026, 8, 16, tzinfo=timezone.utc),
            sender="billing@free-netflix-promo.xyz",
            subject="Invoice receipt",
            merchant="Netflix",
            amount=99.0,
            currency="USD",
            body_snippet="Click here to pay",
            email_type=EmailType.RECEIPT,
        ),
    ]

    results = EmailReconciliationEngine.match_transactions_with_emails(txs, emails)
    assert len(results) == 2

    netflix_match = next(r for r in results if r.transaction_id == "tx_netflix")
    assert netflix_match.match_status == "Có email khớp"
    assert int(netflix_match.confidence_percentage.replace("%", "")) >= 90

    ghost_match = next(r for r in results if r.transaction_id == "tx_ghost")
    assert ghost_match.match_status in ["Không tìm thấy email", "Email nghi giả"]
