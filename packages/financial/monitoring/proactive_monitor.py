import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel, Field

from packages.data.schemas.transaction import Transaction
from packages.data.schemas.alert import Alert
from packages.financial.anomaly.duplicate_detector import DuplicateDetector
from packages.financial.subscriptions.subscription_radar import SubscriptionRadar
from packages.financial.reconciliation.reconciler import ReconciliationEngine
from packages.financial.dispute.reminder_tracker import ReminderTracker
from packages.observability.logging import logger


class ScanReport(BaseModel):
    scan_id: str
    timestamp: str
    total_transactions_scanned: int
    new_transactions_count: int
    new_alerts_count: int
    suppressed_duplicates_count: int
    new_alerts: List[Alert]
    status: str = "COMPLETED"


class ProactiveMonitorState(BaseModel):
    is_running: bool = True
    interval_seconds: int = 30
    total_scans_performed: int = 0
    last_scan_timestamp: Optional[str] = None
    known_transaction_ids: List[str] = Field(default_factory=list)
    alerted_transaction_ids: List[str] = Field(default_factory=list)
    last_scan_report: Optional[ScanReport] = None


class ProactiveMonitorEngine:
    """
    Proactive Periodic Background Scanner.
    - Scans data periodically
    - Saves state from previous runs
    - Identifies new transactions
    - Deduplicates: NEVER re-alerts on previously alerted transactions
    - Never sends duplicate notifications
    """

    _known_tx_ids: Set[str] = set()
    _alerted_tx_ids: Set[str] = set()
    _scanned_alert_fingerprints: Set[str] = set()
    _scan_history: List[ScanReport] = []
    _is_running: bool = True
    _interval_seconds: int = 60
    _total_scans: int = 0
    _last_scan_time: Optional[datetime] = None

    @classmethod
    def get_status(cls) -> ProactiveMonitorState:
        last_rep = cls._scan_history[-1] if cls._scan_history else None
        return ProactiveMonitorState(
            is_running=cls._is_running,
            interval_seconds=cls._interval_seconds,
            total_scans_performed=cls._total_scans,
            last_scan_timestamp=cls._last_scan_time.isoformat() if cls._last_scan_time else None,
            known_transaction_ids=list(cls._known_tx_ids),
            alerted_transaction_ids=list(cls._alerted_tx_ids),
            last_scan_report=last_rep,
        )

    @classmethod
    def set_running(cls, running: bool):
        cls._is_running = running

    @classmethod
    def run_scan(
        cls,
        current_transactions: List[Transaction],
        account_txs: Optional[List[Transaction]] = None,
        wallet_txs: Optional[List[Transaction]] = None,
        card_txs: Optional[List[Transaction]] = None,
        emails: Optional[List[Any]] = None,
    ) -> ScanReport:
        """
        Executes a single scan run with strict deduplication.
        """
        cls._total_scans += 1
        cls._last_scan_time = datetime.now(timezone.utc)
        scan_id = f"scan_{uuid.uuid4().hex[:8]}"

        current_tx_ids = {t.id for t in current_transactions}
        new_tx_ids = current_tx_ids - cls._known_tx_ids
        cls._known_tx_ids.update(current_tx_ids)

        new_alerts: List[Alert] = []
        suppressed_count = 0

        # 1. Run Duplicate Detector
        dup_results = DuplicateDetector.find_duplicates(current_transactions)
        for _, _, alert in dup_results:
            # Fingerprint alert based on involved transaction IDs
            fp = f"DUP_{sorted(alert.transaction_ids)}"
            if fp in cls._scanned_alert_fingerprints or any(t_id in cls._alerted_tx_ids for t_id in alert.transaction_ids):
                suppressed_count += 1
            else:
                cls._scanned_alert_fingerprints.add(fp)
                cls._alerted_tx_ids.update(alert.transaction_ids)
                new_alerts.append(alert)
                # Auto-create reminder if needed
                if alert.transaction_ids:
                    t_match = next((t for t in current_transactions if t.id == alert.transaction_ids[0]), None)
                    if t_match:
                        ReminderTracker.create_reminder(
                            transaction_id=t_match.id,
                            merchant=t_match.merchant_normalized or t_match.merchant_raw,
                            amount=alert.amount or t_match.amount,
                            statement_date=t_match.occurred_at,
                            alert_id=alert.id,
                            notes=alert.reason,
                        )

        # 2. Run Subscription & Price Hike Radar
        _, sub_alerts = SubscriptionRadar.detect_subscriptions(current_transactions)
        for alert in sub_alerts:
            fp = f"SUB_{sorted(alert.transaction_ids)}"
            if fp in cls._scanned_alert_fingerprints or any(t_id in cls._alerted_tx_ids for t_id in alert.transaction_ids):
                suppressed_count += 1
            else:
                cls._scanned_alert_fingerprints.add(fp)
                cls._alerted_tx_ids.update(alert.transaction_ids)
                new_alerts.append(alert)

        # 3. Run 3-Way Reconciliation if multi-source provided
        if account_txs and wallet_txs and card_txs:
            rec_rep = ReconciliationEngine.perform_3way_reconciliation(
                account_txs=account_txs,
                wallet_txs=wallet_txs,
                card_txs=card_txs,
                emails=emails,
            )
            for alert in rec_rep.alerts:
                fp = f"REC_{alert.title}_{sorted(alert.transaction_ids)}"
                if fp in cls._scanned_alert_fingerprints or any(t_id in cls._alerted_tx_ids for t_id in alert.transaction_ids):
                    suppressed_count += 1
                else:
                    cls._scanned_alert_fingerprints.add(fp)
                    cls._alerted_tx_ids.update(alert.transaction_ids)
                    new_alerts.append(alert)

        report = ScanReport(
            scan_id=scan_id,
            timestamp=cls._last_scan_time.strftime("%d/%m/%Y %H:%M:%S"),
            total_transactions_scanned=len(current_transactions),
            new_transactions_count=len(new_tx_ids),
            new_alerts_count=len(new_alerts),
            suppressed_duplicates_count=suppressed_count,
            new_alerts=new_alerts,
        )

        cls._scan_history.append(report)
        if len(cls._scan_history) > 50:
            cls._scan_history.pop(0)

        logger.info(f"[{scan_id}] Proactive Scan Finished: {len(new_alerts)} new alerts, {suppressed_count} duplicates suppressed.")
        return report

    @classmethod
    def get_history(cls) -> List[ScanReport]:
        return list(reversed(cls._scan_history))

    @classmethod
    def reset_state(cls):
        cls._known_tx_ids.clear()
        cls._alerted_tx_ids.clear()
        cls._scanned_alert_fingerprints.clear()
        cls._scan_history.clear()
        cls._total_scans = 0
