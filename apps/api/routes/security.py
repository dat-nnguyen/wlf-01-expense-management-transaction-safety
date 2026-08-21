from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from packages.financial.security.authenticity_engine import (
    authenticity_engine,
    ClaimedTransaction,
    ClaimSourceType,
    AuthenticityVerificationResult,
    SecurityCase,
)
from packages.observability.logging import logger

router = APIRouter(prefix="/api/v1/security", tags=["Security & Authenticity"])


class VerifyClaimRequest(BaseModel):
    claimed_amount: Optional[float] = Field(default=None, description="Monetary amount claimed in evidence")
    currency: str = Field(default="USD", description="Currency code")
    claimed_status: str = Field(default="COMPLETED", description="Claimed status in evidence")
    reference: Optional[str] = Field(default=None, description="Claimed reference ID (e.g. WF-839291)")
    recipient: Optional[str] = Field(default=None, description="Claimed recipient")
    source_type: str = Field(default="SCREENSHOT", description="Type of evidence: SCREENSHOT, PDF, EMAIL, RECEIPT, TEXT")
    raw_text: Optional[str] = Field(default=None, description="Extracted text or user message description")
    account_id: str = Field(default="acc_main", description="Target account ID")


class UpdateCaseStatusRequest(BaseModel):
    status: str = Field(..., description="Target status: REVIEWED, REQUEST_MORE_EVIDENCE, RESOLVED, INVESTIGATING")
    notes: Optional[str] = Field(default=None, description="Review notes")


@router.post("/verify-claim", response_model=AuthenticityVerificationResult)
async def verify_transaction_claim(payload: VerifyClaimRequest):
    """
    Verify whether a claimed payment / transaction (from screenshot, PDF, receipt, or email)
    is supported by trusted Wealify ledger and records.
    Calculates deterministic Evidence Inconsistency Score and returns safe structured findings.
    """
    try:
        if payload.claimed_amount is None and payload.raw_text:
            claim = authenticity_engine.parse_claim_from_text(payload.raw_text)
        else:
            source_enum = ClaimSourceType.SCREENSHOT
            if payload.source_type.upper() in ClaimSourceType.__members__:
                source_enum = ClaimSourceType(payload.source_type.upper())

            claim = ClaimedTransaction(
                claimed_amount=payload.claimed_amount if payload.claimed_amount is not None else 2500.0,
                currency=payload.currency,
                claimed_status=payload.claimed_status,
                reference=payload.reference or "WF-839291",
                recipient=payload.recipient or "John Doe",
                source_type=source_enum,
                raw_snippet=payload.raw_text or f"Payment of ${payload.claimed_amount or 2500.0} USD",
            )

        res = authenticity_engine.verify_claim(claim, account_id=payload.account_id)
        return res
    except Exception as e:
        logger.error(f"Error in verify_transaction_claim: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/cases", response_model=List[SecurityCase])
async def list_security_cases():
    """List all active and historical security anomaly cases for Wealify Operations Console."""
    return authenticity_engine.list_security_cases()


@router.get("/cases/{case_id}", response_model=SecurityCase)
async def get_security_case(case_id: str):
    """Retrieve detailed investigation records for a specific security case."""
    case = authenticity_engine.get_security_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Security Case {case_id} not found")
    return case


@router.post("/cases/{case_id}/review", response_model=SecurityCase)
async def review_security_case(case_id: str, payload: UpdateCaseStatusRequest):
    """
    Update investigation status of a security case.
    Strictly read-only with respect to money (no chargeback or balance mutation).
    """
    case = authenticity_engine.update_case_status(case_id, payload.status)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Security Case {case_id} not found")
    return case


@router.get("/stats")
async def get_security_stats():
    """Retrieve aggregate security statistics for the Security Center Overview dashboard."""
    return authenticity_engine.get_security_stats()
