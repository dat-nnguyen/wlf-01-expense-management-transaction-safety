from typing import Any, Dict, List
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from packages.data.schemas.advisory import HITLActionItem, HITLActionStatus
from packages.connectors.mock.mock_sources import MockTransactionSource, MockEmailSource
from packages.financial.advisory.business_advisor import BusinessAdvisor
from packages.financial.reconciliation.payout_radar import PayoutRadar

router = APIRouter(prefix="/api/v1/hitl", tags=["Human-in-the-Loop"])
tx_source = MockTransactionSource()
em_source = MockEmailSource()

# In-memory mock review queue
_ACTION_STORE: Dict[str, HITLActionItem] = {}


class ActionDecisionRequest(BaseModel):
    decision: str  # "approved" or "rejected"
    comment: str = ""


@router.get("/queue", response_model=List[HITLActionItem])
async def list_hitl_queue():
    if not _ACTION_STORE:
        txs = await tx_source.get_transactions()
        emails = await em_source.get_emails()
        payout_alerts = PayoutRadar.detect_overdue_payouts(payout_emails=emails, account_txs=txs)
        report = BusinessAdvisor.analyze_health(account_id="acc_main", transactions=txs, payout_alerts=payout_alerts)
        for act in report.hitl_actions:
            _ACTION_STORE[act.id] = act

    return list(_ACTION_STORE.values())


@router.post("/actions/{action_id}/decision")
async def submit_decision(action_id: str, req: ActionDecisionRequest):
    if action_id not in _ACTION_STORE:
        raise HTTPException(status_code=404, detail="Action item not found")

    item = _ACTION_STORE[action_id]
    if req.decision.lower() == "approved":
        item.status = HITLActionStatus.APPROVED
    else:
        item.status = HITLActionStatus.REJECTED

    item.resolved_at = datetime.utcnow()
    return {
        "success": True,
        "action_id": action_id,
        "status": item.status,
        "comment": req.comment,
        "resolved_at": item.resolved_at.isoformat(),
    }
