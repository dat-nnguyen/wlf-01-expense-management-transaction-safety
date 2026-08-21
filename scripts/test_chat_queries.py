import sys
import httpx

sys.stdout.reconfigure(encoding='utf-8')

queries = [
    'Tháng này tôi chi bao nhiêu, phí bao nhiêu, 3 khoản lớn nhất là gì?',
    'Khoản $9.99 này là gì — có email xác nhận nào khớp không?',
    'Có tiền nào rời tài khoản nhưng chưa lên thẻ không?',
    'Tôi đang có những subscription nào, gói nào vừa tăng giá?',
    'Có khoản nào bị tính hai lần không?',
    'Gửi báo cáo tháng này vào email của tôi.',
    'Tài khoản mình có an toàn không?',
    'Tự huỷ gói Netflix giùm tôi',
    'Huỷ mấy gói không dùng đi',
    'Gửi email khiếu nại cho ngân hàng giúp tôi',
    'Chuyển $500 sang thẻ giúp tôi',
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
