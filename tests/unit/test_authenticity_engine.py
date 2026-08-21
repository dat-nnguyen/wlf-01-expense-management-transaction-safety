import pytest
from packages.financial.security.authenticity_engine import (
    TransactionAuthenticityEngine,
    ClaimedTransaction,
    ClaimSourceType,
)


def test_authenticity_engine_fake_screenshot_no_ledger_match():
    engine = TransactionAuthenticityEngine()
    
    # Fake screenshot claim: $2,500 USD Ref WF-839291
    claim = ClaimedTransaction(
        claimed_amount=2500.0,
        currency="USD",
        claimed_status="COMPLETED",
        reference="WF-839291",
        source_type=ClaimSourceType.SCREENSHOT,
        raw_snippet="Transfer of $2,500.00 USD completed to Wealify Account ...8821. Ref: WF-839291",
    )

    res = engine.verify_claim(claim)

    assert res.ledger_match is False
    assert res.wallet_match is False
    assert res.email_match is False
    assert res.reference_match is False
    assert res.evidence_conflict_score == 92
    assert res.classification == "Cần bạn tự xác nhận"
    assert res.security_tag == "Có mâu thuẫn bằng chứng"
    assert res.risk_level == "HIGH"
    assert "không tìm thấy giao dịch" in res.ai_summary.lower()


def test_authenticity_engine_legitimate_settlement_match():
    engine = TransactionAuthenticityEngine()

    # Legitimate Stripe settlement: $1,890.00 USD Ref REF_PAY_STP_01
    claim = ClaimedTransaction(
        claimed_amount=1890.0,
        currency="USD",
        claimed_status="COMPLETED",
        reference="REF_PAY_STP_01",
        source_type=ClaimSourceType.EMAIL,
        raw_snippet="Payout of $1,890.00 is on its way",
    )

    res = engine.verify_claim(claim)

    assert res.ledger_match is True
    assert res.email_match is True
    assert res.evidence_conflict_score < 50
    assert res.risk_level in ["LOW", "CLEAN", "MEDIUM"]


def test_authenticity_engine_parse_from_text():
    engine = TransactionAuthenticityEngine()
    
    query = "Người này gửi ảnh nói Wealify đã chuyển $2,500 cho tôi. Mã giao dịch WF-839291. Có thật không?"
    claim = engine.parse_claim_from_text(query)

    assert claim.claimed_amount == 2500.0
    assert claim.reference == "WF-839291"
    assert claim.source_type == ClaimSourceType.SCREENSHOT


def test_security_case_read_only_status_update():
    engine = TransactionAuthenticityEngine()

    case = engine.get_security_case("SC-2026-00021")
    assert case is not None

    updated = engine.update_case_status("SC-2026-00021", "REVIEWED")
    assert updated is not None
    assert updated.status == "REVIEWED"
