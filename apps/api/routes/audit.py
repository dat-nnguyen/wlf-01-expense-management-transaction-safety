"""Audit Trail & Security Flag Export Routes for Wealify Guardian.

Allows compliance inspection & exporting of all security flags, reasons,
and confidence metrics as CSV or JSON file.
"""

import io
import csv
from datetime import datetime
from typing import List
from fastapi import APIRouter, Query, Response
from pydantic import BaseModel, Field

from packages.financial.security.authenticity_engine import authenticity_engine
from packages.financial.anomaly.duplicate_detector import DuplicateDetector
from packages.financial.reconciliation.payout_radar import PayoutRadar
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource

router = APIRouter(prefix="/api/v1/audit", tags=["Audit Trail & Logging"])
mock_txs = MockTransactionSource()
mock_emails = MockEmailSource()


class AuditEntry(BaseModel):
    id: str
    event_type: str
    target_reference: str
    amount: float
    reason: str
    confidence_label: str
    classification: str
    dispute_deadline_days: int = 60
    timestamp: datetime = Field(default_factory=datetime.utcnow)


@router.get("/logs", response_model=List[AuditEntry])
async def get_audit_logs(account_id: str = "acc_main"):
    """
    Retrieves all flagged transactions, anomalies, and authenticity checks.
    """
    logs: List[AuditEntry] = []
    txs = await mock_txs.get_transactions()
    emails = await mock_emails.get_emails()

    # 1. Flagged Authenticity Cases
    for case in authenticity_engine.list_cases(account_id=account_id):
        logs.append(AuditEntry(
            id=case.case_id,
            event_type="TRANSACTION_AUTHENTICITY_FLAG",
            target_reference=case.claimed_transaction.reference or "N/A",
            amount=case.claimed_transaction.claimed_amount,
            reason=f"Evidence Conflict Score: {case.evidence_conflict_score}/100. {case.security_tag}",
            confidence_label="Cao",
            classification=case.classification,
            timestamp=case.created_at,
        ))

    # 2. Duplicate Card Debits
    for _, _, a in DuplicateDetector.find_duplicates(txs):
        logs.append(AuditEntry(
            id=a.id,
            event_type="DUPLICATE_DEBIT_FLAG",
            target_reference=a.transaction_id or "N/A",
            amount=a.amount or 0.0,
            reason=a.message,
            confidence_label=a.confidence_label.value if hasattr(a.confidence_label, 'value') else str(a.confidence_label),
            classification="Cần bạn tự xác nhận",
            timestamp=a.created_at,
        ))

    # 3. Overdue Payouts
    for po in PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=txs):
        logs.append(AuditEntry(
            id=po.id,
            event_type="OVERDUE_PAYOUT_FLAG",
            target_reference=str(po.metadata.get("payout_ref", "N/A")),
            amount=po.amount or 0.0,
            reason=po.message,
            confidence_label="Rất cao",
            classification="Cần bạn tự xác nhận",
            timestamp=po.created_at,
        ))

    return logs


@router.get("/export")
async def export_audit_file(
    format: str = Query("csv", pattern="^(csv|json)$"),
    account_id: str = "acc_main",
):
    """
    Exports the complete audit trail as a downloadable CSV or JSON file.
    Satisfies competition requirement: 'Ghi nhật ký: mỗi lần gắn cờ ghi lại khoản nào, vì lý do gì, mức tin cậy; xuất ra file được.'
    """
    logs = await get_audit_logs(account_id=account_id)

    if format == "json":
        return Response(
            content=f"[{', '.join(entry.model_dump_json() for entry in logs)}]",
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=wealify_audit_log_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"},
        )

    # Export CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Record ID",
        "Event Type",
        "Target Reference",
        "Amount (USD)",
        "Reason / Evidence Note",
        "Confidence Level",
        "Classification Status",
        "Dispute Deadline (Days)",
        "Timestamp (UTC)",
    ])
    for item in logs:
        writer.writerow([
            item.id,
            item.event_type,
            item.target_reference,
            f"{item.amount:.2f}",
            item.reason,
            item.confidence_label,
            item.classification,
            item.dispute_deadline_days,
            item.timestamp.isoformat(),
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=wealify_audit_log_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"},
    )
