import pytest
from datetime import datetime, timezone, timedelta
from packages.financial.dispute.reminder_tracker import ReminderTracker
from packages.financial.monitoring.proactive_monitor import ProactiveMonitorEngine
from packages.data.schemas.transaction import Transaction, TransactionDirection, TransactionSource, TransactionType


def test_reminder_tracker_60_day_deadline():
    ReminderTracker.clear_all()

    statement_date = datetime(2026, 8, 1, tzinfo=timezone.utc)
    success, rem, msg = ReminderTracker.create_reminder(
        transaction_id="tx_dup_01",
        merchant="Facebook Ads",
        amount=150.0,
        statement_date=statement_date,
    )
    assert success is True
    assert rem is not None
    assert rem.statement_date == statement_date.strftime("%d/%m/%Y")

    # Deadline must be exactly statement_date + 60 days
    expected_deadline = (statement_date + timedelta(days=60)).strftime("%d/%m/%Y")
    assert rem.deadline_date == expected_deadline

    # Test Duplicate Prevention
    success_dup, rem_dup, msg_dup = ReminderTracker.create_reminder(
        transaction_id="tx_dup_01",
        merchant="Facebook Ads",
        amount=150.0,
        statement_date=statement_date,
    )
    assert success_dup is False
    assert "đã tồn tại" in msg_dup.lower()


def test_proactive_monitor_deduplication():
    ProactiveMonitorEngine.reset_state()

    tx = Transaction(
        id="tx_test_01",
        account_id="acc_main",
        source=TransactionSource.CARD,
        transaction_type=TransactionType.CARD_PURCHASE,
        amount=150.0,
        currency="USD",
        direction=TransactionDirection.DEBIT,
        merchant_raw="Facebook Ads",
        occurred_at=datetime.now(timezone.utc),
    )

    # First Scan
    report1 = ProactiveMonitorEngine.run_scan(
        current_transactions=[tx],
        account_txs=[],
        wallet_txs=[],
        card_txs=[tx],
        emails=[],
    )
    assert report1.new_transactions_count == 1

    # Second Scan with same data (must not create new transactions or duplicate alerts)
    report2 = ProactiveMonitorEngine.run_scan(
        current_transactions=[tx],
        account_txs=[],
        wallet_txs=[],
        card_txs=[tx],
        emails=[],
    )
    assert report2.new_transactions_count == 0
    assert report2.new_alerts_count == 0
