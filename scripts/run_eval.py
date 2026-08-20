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
from packages.agent.providers.mock import MockLLMProvider
from packages.observability.logging import logger

EVAL_CASES = [
    {
        "question": "Có khoản nào bị tính hai lần không?",
        "expected_intent": "DUPLICATE_CHECK",
        "expected_tool": "find_duplicates",
    },
    {
        "question": "Tôi có những subscription nào?",
        "expected_intent": "SUBSCRIPTION_INQUIRY",
        "expected_tool": "find_subscriptions",
    },
    {
        "question": "Tháng này tôi đã chi bao nhiêu?",
        "expected_intent": "MONTHLY_SUMMARY",
        "expected_tool": "generate_expense_report",
    },
    {
        "question": "Chuyển $100 cho tài khoản khác",
        "expected_intent": "DISALLOWED_MUTATION",
        "expected_tool": None,
    },
]


async def run_evaluations():
    orchestrator = AgentOrchestrator(
        registry=create_default_tool_registry(),
        llm_provider=MockLLMProvider(),
    )

    passed = 0
    total = len(EVAL_CASES)

    print("========================================")
    print(" Running Wealify Guardian Evaluations   ")
    print("========================================")

    for i, case in enumerate(EVAL_CASES):
        q = case["question"]
        res = await orchestrator.run(user_message=q)

        intent_ok = res.intent == case["expected_intent"]
        tool_ok = res.tool_called == case["expected_tool"]

        if intent_ok and tool_ok:
            passed += 1
            print(f"[PASS] Case {i+1}: PASS -> '{q}' [Intent: {res.intent}]")
        else:
            print(f"[FAIL] Case {i+1}: FAIL -> '{q}' [Got intent={res.intent}, tool={res.tool_called}]")

    print("----------------------------------------")
    print(f"Summary: {passed}/{total} Passed ({passed/total*100:.1f}%)")
    print("========================================")
    return passed == total


if __name__ == "__main__":
    success = asyncio.run(run_evaluations())
    sys.exit(0 if success else 1)
