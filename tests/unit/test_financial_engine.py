from datetime import datetime, timedelta
import pytest
from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionSource, TransactionType
from packages.data.schemas.email import EmailEvidence, EmailType
from packages.financial.anomaly.duplicate_detector import DuplicateDetector
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar
from packages.financial.reconciliation.reconciler import ReconciliationEngine
from packages.financial.reconciliation.payout_radar import PayoutRadar
from packages.financial.advisory.business_advisor import BusinessAdvisor
from packages.financial.classification.classifier import classify_transaction


def test_classify_transaction():
    tx_sub = Transaction(
        id="t1",
        occurred_at=datetime.utcnow(),
        amount=9.99,
        merchant_raw="NETFLIX.COM PAYMENT",
        merchant_normalized="Netflix",
    )
    assert classify_transaction(tx_sub) == TransactionType.SUBSCRIPTION

    tx_fee = Transaction(
        id="t2",
        occurred_at=datetime.utcnow(),
        amount=2.50,
        merchant_raw="ATM Service Fee",
        merchant_normalized="Atm Service Fee",
    )
    assert classify_transaction(tx_fee) == TransactionType.FEE


def test_duplicate_detector_virtual_cards():
    now = datetime.utcnow()
    tx1 = Transaction(
        id="tx1",
        occurred_at=now,
        amount=150.00,
        merchant_raw="Facebook Ads",
        merchant_normalized="Facebook Ads",
        card_id="vcard_fb_01",
        bank_name="VPBank",
    )
    tx2 = Transaction(
        id="tx2",
        occurred_at=now + timedelta(minutes=2),
        amount=150.00,
        merchant_raw="Facebook Ads",
        merchant_normalized="Facebook Ads",
        card_id="vcard_fb_01",
        bank_name="VPBank",
    )
    tx3 = Transaction(
        id="tx3",
        occurred_at=now,
        amount=420.00,
        merchant_raw="Google Ads",
        merchant_normalized="Google Ads",
        card_id="vcard_gg_02",
        bank_name="VPBank",
    )

    dups = DuplicateDetector.find_duplicates([tx1, tx2, tx3])
    assert len(dups) == 1
    t_a, t_b, alert = dups[0]
    assert alert.status.value == "Cần bạn tự xác nhận"
    assert alert.confidence >= 0.95
    assert alert.deadline_days == 60
    assert "Facebook Ads" in alert.title
    assert alert.dispute_draft is not None


def test_subscription_radar_detection_and_price_hike():
    now = datetime.utcnow()
    tx_june = Transaction(
        id="tx_sub_1",
        occurred_at=now - timedelta(days=60),
        amount=49.99,
        merchant_raw="Adobe Creative",
        merchant_normalized="Adobe",
    )
    tx_july = Transaction(
        id="tx_sub_2",
        occurred_at=now - timedelta(days=30),
        amount=49.99,
        merchant_raw="Adobe Creative",
        merchant_normalized="Adobe",
    )
    tx_aug = Transaction(
        id="tx_sub_3",
        occurred_at=now,
        amount=54.99,
        merchant_raw="Adobe Creative",
        merchant_normalized="Adobe",
    )

    subs, alerts = SubscriptionRadar.detect_subscriptions([tx_june, tx_july, tx_aug])
    assert len(subs) == 1
    assert subs[0].merchant == "Adobe"
    assert subs[0].price_changed is True
    assert subs[0].annual_cost == round(54.99 * 12, 2)
    assert len(alerts) == 1
    assert alerts[0].status.value == "Cần bạn tự xác nhận"


def test_payout_radar_overdue_detection():
    now = datetime(2026, 8, 21, 10, 0, 0)
    email_payout = EmailEvidence(
        id="em_amz_01",
        date=datetime(2026, 8, 5, 10, 0, 0),  # 16 days ago
        sender="payments-update@amazon.com",
        subject="Amazon Disbursement Notice",
        merchant="Amazon Seller Central",
        amount=4250.00,
        currency="USD",
        body_snippet="Initiated payout of $4,250.00 to account ...8821.",
        email_type=EmailType.PAYOUT_NOTIFICATION,
        payout_ref="AMZ-DISB-8821",
        expected_settlement_days=3,
    )

    # No matching credit transaction in account
    acc_txs = [
        Transaction(
            id="tx_other",
            occurred_at=datetime(2026, 8, 1, 10, 0, 0),
            amount=3500.00,
            direction=TransactionDirection.CREDIT,
            merchant_raw="Payroll",
            merchant_normalized="Payroll",
        )
    ]

    alerts = PayoutRadar.detect_overdue_payouts(
        payout_emails=[email_payout],
        account_txs=acc_txs,
        current_time=now,
    )
    assert len(alerts) == 1
    alert = alerts[0]
    assert alert.alert_type.value == "overdue_payout"
    assert alert.days_overdue == 16
    assert alert.amount == 4250.00
    assert alert.dispute_draft is not None
    assert "Amazon Seller Central" in alert.title


def test_business_advisor_unit_economics():
    now = datetime.utcnow()
    txs = [
        # Ad Spend on Virtual Cards
        Transaction(
            id="tx_fb",
            occurred_at=now,
            amount=300.00,
            direction=TransactionDirection.DEBIT,
            transaction_type=TransactionType.AD_SPEND,
            merchant_raw="Facebook Ads",
            merchant_normalized="Facebook Ads",
        ),
        Transaction(
            id="tx_gg",
            occurred_at=now,
            amount=420.00,
            direction=TransactionDirection.DEBIT,
            transaction_type=TransactionType.AD_SPEND,
            merchant_raw="Google Ads",
            merchant_normalized="Google Ads",
        ),
        # Payout Received
        Transaction(
            id="tx_stp",
            occurred_at=now,
            amount=1890.00,
            direction=TransactionDirection.CREDIT,
            merchant_raw="Stripe Payout Settlement",
            merchant_normalized="Stripe",
            tags=["payout"],
        ),
    ]

    report = BusinessAdvisor.analyze_health("acc_main", txs)
    assert report.metrics.total_ad_spend == 720.00
    assert report.metrics.total_payout_received == 1890.00
    assert report.metrics.roas > 2.0
    assert report.health_score > 50
    assert len(report.hitl_actions) >= 0
