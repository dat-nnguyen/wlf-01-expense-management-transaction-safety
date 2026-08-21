# 🚀 Hướng Dẫn Khởi Chạy 10 Phút — Wealify Guardian

> **Đề tài:** WLF-01 · Wealify — Quản lý chi tiêu & an toàn giao dịch  
> **Kiến trúc:** Google Agent Development Kit (ADK) + Google Gemini 2.0 Flash + Dual Deterministic Financial Engine + Next.js Enterprise Dashboard

---

## ⏱️ Khởi Chạy Nhanh Trong 3 Bước (Dưới 10 Phút)

### Cách 1: Chạy 1 Lệnh Duy Nhất Bằng Docker Compose (Khuyên Dùng)

```bash
# 1. Clone repository
git clone https://github.com/dat-nnguyen/wlf-01-expense-management-transaction-safety.git
cd wlf-01-expense-management-transaction-safety

# 2. Cấu hình biến môi trường
cp .env.example .env

# 3. Khởi chạy toàn bộ hệ thống (Web + API + PostgreSQL)
docker compose up --build -d
```

Sau khi chạy xong, truy cập:
* 🖥️ **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
* 📚 **API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* 🩺 **Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Cách 2: Chạy Môi Trường Phát Triển Cục Bộ (Local Development)

#### 1. Cài đặt Backend (Python 3.10+)
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Cài đặt Frontend (Node.js 18+)
```bash
cd apps/web
npm install
npm run dev
# Mở trình duyệt tại http://localhost:3000
```

---

## 🧪 Chạy Kiểm Thử Tự Động (Automated Test Suite)

Toàn bộ **40 Test Cases** (Unit & Integration) được kiểm thử tự động với 1 lệnh:

```bash
pytest
```

Kết quả: **40/40 Tests Passed (100%)** không có lỗi cú pháp hay cảnh báo thời gian thực.

---

## 🎯 5 Kịch Bản Trải Nghiệm Nhanh Trên Giao Diện

1. **Báo cáo tài chính & Phí:** Gõ vào Chat Copilot: *"Tháng này tôi chi bao nhiêu? Phí phát sinh là bao nhiêu?"*
2. **Đối soát 3 nguồn (3-Way Reconciliation):** Gõ: *"Có tiền nào rời tài khoản nhưng chưa lên thẻ không?"*
3. **Quét quẹt trùng thẻ ảo (Duplicate):** Gõ: *"Có khoản nào bị tính 2 lần trên thẻ không?"*
4. **Kiểm tra tăng giá ngầm (Subscription Price Hike):** Gõ: *"Có gói phần mềm nào vừa tăng giá không?"*
5. **Thẩm định biên lai giả mạo (Fake Receipt Verification):** Gõ: *"Người này gửi ảnh nói Wealify đã chuyển $2,500 cho tôi với mã WF-839291, có thật không?"*
