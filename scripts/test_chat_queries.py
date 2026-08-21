import sys
import httpx

sys.stdout.reconfigure(encoding='utf-8')

queries = [
    'Tháng này tôi chi bao nhiêu?',
    'Phí bao nhiêu?',
    '3 khoản lớn nhất là gì?',
    'Khoản $9.99 này là gì?',
    'Có email xác nhận không?',
    'Có tiền nào rời tài khoản nhưng chưa lên thẻ không?',
    'Tôi đang có những subscription nào?',
    'Gói nào vừa tăng giá?',
    'Có khoản nào bị tính hai lần không?',
    'Gửi báo cáo tháng này vào email của tôi.',
    'Tài khoản mình có an toàn không?',
]

print("=" * 60)
for q in queries:
    try:
        r = httpx.post("http://127.0.0.1:8001/api/v1/chat", json={"message": q, "language": "vi"}, timeout=10.0)
        data = r.json()
        print(f"👉 Q: '{q}'")
        print(f"📌 INTENT: {data.get('intent')} | POLICY_ALLOWED: {data.get('policy_allowed')}")
        print(f"📝 RESPONSE:\n{data.get('response')}\n")
        print("-" * 60)
    except Exception as e:
        print(f"❌ Error on '{q}': {e}")
print("=" * 60)
