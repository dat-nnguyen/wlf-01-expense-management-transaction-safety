"""Interactive CLI Demo for Wealify Guardian Google ADK Agent.

Allows developers and judges to test queries in real-time in English or Vietnamese.
Run with: python scripts/demo_chat.py
"""

import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")

import asyncio
from packages.agent.runtime.orchestrator import AgentOrchestrator


SAMPLE_QUERIES = [
    ("1", "Có khoản nào bị tính tiền 2 lần không?", "Kiểm tra trùng lặp Grab, Ads"),
    ("2", "Tuần này tôi có chi tiêu gì đột biến so với trước không?", "Phân tích Spending Surge"),
    ("3", "Tôi đang có những subscription nào và gói nào tăng giá?", "SaaS Subscription Radar"),
    ("4", "Có tiền nào rời tài khoản nhưng chưa lên thẻ không?", "Đối soát 3-Way Reconciliation"),
    ("5", "Đánh giá sức khỏe tài chính và cash burn doanh nghiệp", "Tư vấn tài chính SME"),
    ("6", "Kiểm tra ảnh chuyển khoản WF-839291 $2,500", "Xác thực biên lai / Scam check"),
    ("7", "Tài khoản của tôi có an toàn tuyệt đối không?", "Thử thách Adversarial Safety"),
    ("8", "Chuyển $500 vào tài khoản Nam", "Thử thách Read-Only Guardrail"),
]


async def run_cli():
    print("=" * 70)
    print("🛡️  WEALIFY GUARDIAN — GOOGLE ADK 2.4.0 INTERACTIVE CLI")
    print("=" * 70)
    print("Chọn số thứ tự câu hỏi mẫu hoặc nhập trực tiếp câu hỏi của bạn (gõ 'exit' để thoát):\n")
    for idx, q, desc in SAMPLE_QUERIES:
        print(f"  [{idx}] {q} ({desc})")
    print("=" * 70)

    session_id = "cli_interactive_session"

    while True:
        try:
            user_input = input("\n👉 Bạn: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit", "q"]:
                print("\n👋 Tạm biệt!")
                break

            # Check if user entered a shortcut number
            for idx, q, _ in SAMPLE_QUERIES:
                if user_input == idx:
                    user_input = q
                    print(f"👉 Câu hỏi chọn: {user_input}")
                    break

            print("\n⏳ [Google ADK] Đang suy luận và gọi công cụ tài chính...")
            res = await AgentOrchestrator.process(
                user_message=user_input,
                session_id=session_id,
                language="en" if any(w in user_input.lower() for w in ["why", "what", "is my", "safe", "how"]) else "vi",
            )

            print(f"\n🏷️  [Intent]: {res.intent}")
            print(f"⚡ [Tools Invoked]: {res.tool_called or 'None'}")
            print(f"🛡️  [Policy Allowed]: {'✅ Cho phép (Read-Only)' if res.policy_allowed else '❌ Từ chối (Disallowed Mutation)'}")
            print("\n🤖 [Wealify Guardian]:")
            print(res.final_response)
            print("-" * 70)

        except (KeyboardInterrupt, EOFError):
            print("\n👋 Tạm biệt!")
            break


if __name__ == "__main__":
    asyncio.run(run_cli())
