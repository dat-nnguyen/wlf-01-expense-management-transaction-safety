import asyncio
import pytest
from packages.financial.anomaly.spending_surge import SpendingSurgeRadar
from packages.connectors.mock.mock_sources import MockTransactionSource
from packages.agent.runtime.orchestrator import AgentOrchestrator


from packages.agent.providers import MockLLMProvider


def test_spending_surge_radar_detection():
    source = MockTransactionSource()
    txs = asyncio.run(source.get_transactions())

    report = SpendingSurgeRadar.detect_surges(transactions=txs, window_days=7)
    
    assert report.is_surge is True
    assert report.surge_percentage > 50.0  # Spike from Meta Ads & AWS
    assert report.current_period_spend > report.historical_baseline_spend
    assert len(report.category_breakdowns) > 0
    assert report.primary_surge_category in ["Digital Ads & Marketing", "Cloud & Infrastructure"]
    assert "Chi tiêu Đột biến" in report.explanation_vi or "đột biến" in report.explanation_vi.lower()
    assert "Spending Surge" in report.explanation_en or "surge" in report.explanation_en.lower()


def test_agent_spending_surge_inquiry():
    orchestrator = AgentOrchestrator(llm_provider=MockLLMProvider())

    # User asks in Vietnamese about spending surge
    res = asyncio.run(orchestrator.run(
        user_message="Tuần này tôi có chi tiêu gì đột biến bất thường so với trước không?",
        language="vi",
    ))
    assert res.intent == "SPENDING_SURGE_INQUIRY"
    assert res.tool_called == "detect_spending_surges"
    assert "đột biến" in res.final_response.lower() or "tăng" in res.final_response.lower()


def test_agent_spending_surge_inquiry_english():
    orchestrator = AgentOrchestrator(llm_provider=MockLLMProvider())

    # User asks in English
    res = asyncio.run(orchestrator.run(
        user_message="Why is my spending surging this week compared to my baseline?",
        language="en",
    ))
    assert res.intent == "SPENDING_SURGE_INQUIRY"
    assert res.tool_called == "detect_spending_surges"
    assert "spending surge" in res.final_response.lower() or "surge" in res.final_response.lower()
