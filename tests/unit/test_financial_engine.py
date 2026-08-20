from datetime import datetime, timedelta
import pytest
from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionSource, TransactionType
from packages.financial.anomaly.duplicate_detector import DuplicateDetector
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar
from packages.financial.reconciliation.reconciler import ReconciliationEngine
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


def test_duplicate_detector():
    now = datetime.utcnow()
    tx1 = Transaction(
        id="tx1",
        occurred_at=now,
        amount=24.50,
        merchant_raw="Grab",
        merchant_normalized="Grab",
    )
    tx2 = Transaction(
        id="tx2",
        occurred_at=now + timedelta(minutes=5),
        amount=24.50,
        merchant_raw="Grab",
        merchant_normalized="Grab",
    )
    tx3 = Transaction(
        id="tx3",
        occurred_at=now,
        amount=10.00,
        merchant_raw="Starbucks",
        merchant_normalized="Starbucks",
    )

    dups = DuplicateDetector.find_duplicates([tx1, tx2, tx3])
    assert len(dups) == 1
    t_a, t_b, alert = dups[0]
    assert alert.status.value == "Cần bạn tự xác nhận"
    assert alert.confidence >= 0.90


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


def test_reconciliation_unreconciled_wallet():
    now = datetime.utcnow()
    acc_tx = Transaction(
        id="acc_1",
        occurred_at=now,
        amount=50.00,
        merchant_raw="Wallet Topup",
        merchant_normalized="Wallet Topup",
        direction=TransactionDirection.DEBIT,
        source=TransactionSource.ACCOUNT,
    )

    alerts = ReconciliationEngine.reconcile_sources(
        account_txs=[acc_tx],
        wallet_txs=[],
        card_txs=[],
    )
    assert len(alerts) >= 1
    assert alerts[0].status.value == "Cần bạn tự xác nhận"
