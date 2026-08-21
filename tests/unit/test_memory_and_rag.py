import pytest
from packages.agent.memory import session_memory
from packages.agent.rag import financial_rag


def test_session_memory_retention():
    session_id = "test_ses_999"
    session_memory.clear(session_id)

    session_memory.add_message(session_id, "user", "Khoản Netflix $9.99 này là gì?")
    session_memory.add_message(session_id, "assistant", "Đây là gói đăng ký định kỳ Netflix hàng tháng.")

    history = session_memory.get_history(session_id)
    assert len(history) == 2
    assert history[0].role == "user"
    assert history[1].role == "assistant"

    context = session_memory.get_formatted_context(session_id)
    assert "Khoản Netflix" in context
    assert "Wealify Guardian" in context


def test_financial_rag_merchant_disambiguation():
    results = financial_rag.search_evidence("AMZN MKTP US")
    assert len(results) > 0
    assert any(r.category == "MERCHANT_KNOWLEDGE" for r in results)
    assert any("Amazon" in r.title for r in results)


def test_financial_rag_dispute_regulation():
    results = financial_rag.search_evidence("thời hạn khiếu nại ngân hàng Mỹ")
    assert len(results) > 0
    assert any("60 ngày" in r.content or "Regulation E" in r.content for r in results)


def test_financial_rag_email_evidence():
    results = financial_rag.search_evidence("payout giải ngân")
    assert len(results) > 0
