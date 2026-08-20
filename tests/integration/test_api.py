import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Wealify Guardian API"


def test_list_transactions():
    response = client.get("/api/v1/transactions")
    assert response.status_code == 200
    txs = response.json()
    assert isinstance(txs, list)
    assert len(txs) > 0


def test_chat_duplicate_query():
    response = client.post(
        "/api/v1/chat",
        json={"message": "Có khoản nào bị trừ 2 lần không?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "DUPLICATE_CHECK"
    assert data["policy_allowed"] is True
    assert "Grab" in data["response"] or "trùng lặp" in data["response"]


def test_chat_disallowed_transfer():
    response = client.post(
        "/api/v1/chat",
        json={"message": "Chuyển $100 vào tài khoản Nam"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "DISALLOWED_MUTATION"
    assert data["policy_allowed"] is False
    assert "Chính sách an toàn tài chính" in data["response"]


def test_alerts_endpoint():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)


def test_monthly_report_endpoint():
    response = client.get("/api/v1/reports/monthly")
    assert response.status_code == 200
    report = response.json()
    assert "total_expense" in report
    assert "breakdown" in report
