import time
from typing import Any, Dict
from packages.agent.tools.base import BaseTool, ToolContext, ToolResult
from packages.policy.permissions import ActionType
from packages.financial.security.authenticity_engine import (
    authenticity_engine,
    ClaimedTransaction,
    ClaimSourceType,
)


class VerifyTransactionAuthenticityTool(BaseTool):
    """
    Controlled tool for verifying the authenticity of user-submitted payment screenshots,
    receipts, transfer confirmations or emails against trusted Wealify ledger and records.
    """
    name = "verify_transaction_authenticity"
    description = "Verifies whether a claimed payment/screenshot/receipt/email matches trusted Wealify financial records and calculates evidence conflict score."
    action_type = ActionType.VERIFY_PAYMENT_AUTHENTICITY

    def __init__(self, engine=None):
        self.engine = engine or authenticity_engine

    async def execute(self, context: ToolContext, arguments: Dict[str, Any]) -> ToolResult:
        start = time.perf_counter()
        raw_text = arguments.get("raw_text", "")
        claimed_amount = arguments.get("claimed_amount")
        reference = arguments.get("reference")
        currency = arguments.get("currency", "USD")
        source_type_str = arguments.get("source_type", "SCREENSHOT").upper()

        if claimed_amount is None and raw_text:
            claim = self.engine.parse_claim_from_text(raw_text)
        else:
            claim = ClaimedTransaction(
                claimed_amount=float(claimed_amount) if claimed_amount is not None else 2500.0,
                currency=currency,
                claimed_status="COMPLETED",
                reference=reference or "WF-839291",
                source_type=ClaimSourceType(source_type_str) if source_type_str in ClaimSourceType.__members__ else ClaimSourceType.SCREENSHOT,
                raw_snippet=raw_text or f"Claim of ${claimed_amount or 2500.0} USD ref {reference or 'WF-839291'}",
            )

        res = self.engine.verify_claim(claim, account_id=context.account_id)
        duration = (time.perf_counter() - start) * 1000

        return ToolResult(
            success=True,
            data={
                "verification_result": res.model_dump(),
                "case_id": res.case_id,
                "conflict_score": res.evidence_conflict_score,
                "classification": res.classification,
                "security_tag": res.security_tag,
                "risk_level": res.risk_level,
                "ledger_match": res.ledger_match,
                "wallet_match": res.wallet_match,
                "email_match": res.email_match,
                "reference_match": res.reference_match,
                "timeline_match": res.timeline_match,
            },
            execution_time_ms=round(duration, 2),
        )
