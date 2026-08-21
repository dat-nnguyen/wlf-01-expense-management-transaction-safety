import asyncio
import sys
from pathlib import Path

# Ensure UTF-8 output encoding for console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

root_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root_dir))

from packages.agent.runtime.orchestrator import AgentOrchestrator
from packages.agent.tools import create_default_tool_registry
from packages.agent.providers import MockLLMProvider
from packages.observability.logging import logger

EVAL_CASES = [
    {
        "question": "Có khoản Payout nào từ Amazon hay Stripe bị trễ chưa về tài khoản Wealify không?",
        "expected_intent": "OVERDUE_PAYOUT_CHECK",
        "expected_tool": "detect_overdue_payouts",
    },
    {
        "question": "Thẻ ảo chạy ads của tôi có bị cà 2 lần không?",
        "expected_intent": "DUPLICATE_CHECK",
        "expected_tool": "find_duplicates",
    },
    {
        "question": "Tôi có những subscription nào và có công cụ nào tăng giá không?",
        "expected_intent": "SUBSCRIPTION_INQUIRY",
        "expected_tool": "find_subscriptions",
    },
    {
        "question": "Tình hình kinh doanh và lợi nhuận dòng tiền của tôi thế nào, có nên tiếp tục chạy ad không?",
        "expected_intent": "BUSINESS_HEALTH_ADVISORY",
        "expected_tool": "analyze_business_health",
    },
    {
        "question": "Tháng này tôi đã chi bao nhiêu?",
        "expected_intent": "MONTHLY_SUMMARY",
        "expected_tool": "generate_expense_report",
    },
    {
        "question": "Người này gửi ảnh nói Wealify đã chuyển $2,500 cho tôi. Có thật không?",
        "expected_intent": "VERIFY_TRANSACTION_AUTHENTICITY",
        "expected_tool": "verify_transaction_authenticity",
    },
    {
        "question": "Chuyển $100 cho tài khoản khác",
        "expected_intent": "DISALLOWED_MUTATION",
        "expected_tool": None,
    },
    {
        "question": "Tuần này tôi có khoản chi tiêu nào tăng đột biến bất thường so với trước không?",
        "expected_intent": "SPENDING_SURGE_INQUIRY",
        "expected_tool": "detect_spending_surges",
    },
]


async def run_evaluations():
    orchestrator = AgentOrchestrator(
        registry=create_default_tool_registry(),
        llm_provider=MockLLMProvider(),
    )

    passed = 0
    total = len(EVAL_CASES)

    print("======================================================")
    print(" Running Wealify Guardian Enterprise AI Evaluations   ")
    print("======================================================")

    for i, case in enumerate(EVAL_CASES):
        q = case["question"]
        res = await orchestrator.run(user_message=q)

        intent_ok = res.intent == case["expected_intent"]
        tool_ok = res.tool_called == case["expected_tool"]
        grounding_ok = res.grounding_verified is True

        if intent_ok and tool_ok and grounding_ok:
            passed += 1
            print(f"[PASS] Case {i+1}: PASS -> '{q}' [Intent: {res.intent} | Tool: {res.tool_called} | Grounding: OK]")
        else:
            print(f"[FAIL] Case {i+1}: FAIL -> '{q}' [Got intent={res.intent}, tool={res.tool_called}, grounding={res.grounding_verified}]")

    print("------------------------------------------------------")
    print(f"Summary: {passed}/{total} Passed ({passed/total*100:.1f}%)")
    print("======================================================")
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(run_evaluations())
    sys.exit(0 if success else 1)
