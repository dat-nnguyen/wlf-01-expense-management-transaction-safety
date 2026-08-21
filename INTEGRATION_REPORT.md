# 🛡️ WEALIFY GUARDIAN — TÀI LIỆU CHI TIẾT TỔNG HỢP NHÁNH `integrate-main`
*(Integration & Architecture Documentation — Branch: `integrate-main`)*

---

## 📌 1. TỔNG QUAN & MỤC TIÊU CỦA NHÁNH (`integrate-main`)

Nhánh **`integrate-main`** là nhánh tích hợp toàn diện, kết hợp nền tảng logic lõi bảo vệ an toàn tài chính (ADK Agent, Financial RAG, Session Memory, Bilingual Engine, Audit Trail) từ nhánh `main` cùng hệ thống giao diện hiện đại **Obsidian Fintech UI**, **Email Alert Dispatcher** và **Bảng điều khiển Giám sát Bot Fleet Telemetry (Security Center)** từ nhánh `feat/update`.

Đặc biệt, nhánh này đã **loại bỏ hoàn toàn dữ liệu giả lập (mock data cứng)** và tích hợp trực tiếp với bộ dữ liệu chính thức **[`wlf15_inbox_3users.xlsx`](./wlf15_inbox_3users.xlsx)** cùng các tệp sao kê ngân hàng thực tế.

---

## 🏗️ 2. KIẾN TRÚC HỆ THỐNG TOÀN DIỆN (SYSTEM ARCHITECTURE)

```
┌────────────────────────────────────────────────────────────────────────┐
│               FRONTEND (Next.js 14 + Obsidian Fintech UI)              │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐ │
│  │     User Financial Copilot    │   │   Admin Bot Fleet Telemetry   │ │
│  │   (AI Chat, Evidence Viewer)  │   │  (12 Bots Health & Incidents) │ │
│  └───────────────┬───────────────┘   └───────────────┬───────────────┘ │
└──────────────────┼───────────────────────────────────┼─────────────────┘
                   │ HTTP / JSON API (Port 8000)       │
┌──────────────────▼───────────────────────────────────▼─────────────────┐
│              FASTAPI BACKEND & AI AGENT ORCHESTRATION LAYER            │
│                                                                        │
│  1. 🛡️ Input Guardrail (Chặn lệnh sửa/chuyển tiền - Read-Only Policy)  │
│  2. 🧭 Intent Planner & Google ADK GuardianAgent                       │
│  3. ⚙️ Safe Tool Execution Layer                                       │
│     ├── search_transactions                                            │
│     ├── find_duplicates (Radar quét quẹt thẻ đúp 48h)                  │
│     ├── detect_overdue_payouts (Radar trễ giải ngân Payout)            │
│     ├── verify_transaction_authenticity (So khớp ảnh chuyển khoản)     │
│     ├── find_subscriptions & detect_price_hike                         │
│     ├── analyze_business_health (Cố vấn tài chính & ROAS)              │
│     └── reconcile_transactions (Đối soát đa nguồn)                     │
│  4. 📚 Financial RAG & Grounding Engine (Regulation E 60 ngày)         │
│  5. 🧠 Multi-turn Session Memory (Lưu ngữ cảnh hội thoại đa lượt)     │
│  6. 🤖 Live LLM Provider (OpenRouter - openai/gpt-4o-mini)             │
│  7. 📬 Email Alert Dispatcher (Tự động gửi cảnh báo bất thường)        │
│  8. 🛡️ Output Guardrail (Zero-Hallucination Sanitization)              │
│  9. 📝 Audit Trail Logger (/api/v1/audit/export)                       │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────────────────────┐
│                 OFFICIAL DATASET & CONNECTOR LAYER                     │
│  ├── 📁 wlf15_inbox_3users.xlsx (148 Emails: Payouts, Receipts, Phish) │
│  │   ├── wealifytester                                                 │
│  │   ├── wealifyjunior                                                 │
│  │   └── wealifysenior                                                 │
│  ├── 📊 data/sample/card_statements.csv (Sao kê thẻ ảo)                │
│  └── 🏦 data/sample/account_transactions.csv (Sổ cái tài khoản Wealify)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 3. CHI TIẾT CÁC TÍNH NĂNG & THAY ĐỔI ĐÃ THỰC HIỆN

### 1. 📂 Chuyển đổi dữ liệu chính thức từ `wlf15_inbox_3users.xlsx`
- **Gỡ bỏ Mock Data cứng**: Toàn bộ mock data tĩnh trong bộ nhớ đã được thay thế bằng trình nạp dữ liệu động từ file Excel chính thức và CSV sao kê ngân hàng (`packages/connectors/mock/mock_sources.py`).
- **Nạp 148 email chính thức**: Đọc toàn bộ các sheet `wealifytester`, `wealifyjunior`, `wealifysenior` thông qua `ExcelInboxConnector`.
- **Trích xuất thông minh**:
  - Tự động bóc tách số tiền giao dịch (`amount`), loại email (`receipt`, `payout`, `promo_spam`, `phishing`), mã đối soát (`matched_txn_id`).
  - Chuẩn hóa tên đơn vị phát hành: **Payoneer, PayPal, Amazon Seller, Stripe, Netflix, Adobe, OpenAI ChatGPT Plus, Spotify, Google, Canva, Figma, v.v.**

---

### 2. 🤖 Tích hợp Live AI Agent ngoài (OpenRouter / GPT-4o-mini)
- **Cấu hình Live Provider**: Chuyển từ mock synthesis sang gọi API thực tế của **OpenRouter** (`openai/gpt-4o-mini`) tại `packages/agent/providers/llm_provider.py`.
- **Prompt An toàn Tài chính**: Ép buộc mô hình tuân thủ quy tắc **Zero-Hallucination** (không bịa đặt số liệu), trích dẫn bằng chứng từ sổ cái và áp dụng quy định **Regulation E (thời hạn khiếu nại 60 ngày)**.
- **Deterministic Policy Refusal**: Khi phát hiện ý định can thiệp/chuyển tiền (`DISALLOWED_MUTATION`), hệ thống từ chối an toàn ở tầng deterministic logic mà không cần tiêu tốn token gọi LLM.

---

### 3. 🧠 Multi-turn Session Memory & Financial RAG Engine
- **Session Memory (`packages/agent/memory/session_memory.py`)**:
  - Lưu trữ lịch sử trao đổi theo từng `session_id`, duy trì mạch ngữ cảnh giúp người dùng hỏi tiếp các câu phụ (VD: *"Khoản đó là của ai?"*, *"Gửi email tra soát cho tôi"*).
- **Financial RAG Engine (`packages/agent/rag/financial_rag.py`)**:
  - **Merchant Disambiguation**: Giải mã tên viết tắt lạ trên sao kê (VD: `ADOBE *CREATIVE CLOUD` -> Adobe CC, `GRAB* TRANSPORT` -> Grab).
  - **Statutory Rules**: Tự động chèn quy định quyền khiếu nại 60 ngày theo Đạo luật Chuyển tiền Điện tử Hoa Kỳ (Regulation E).
  - **Email Evidence Grounding**: Đối chiếu chéo biên nhận email gốc để chứng minh tính xác thực của giao dịch.

---

### 4. 🛡️ Bộ Công Cụ Radar & An Toàn Giao Dịch
1. **Radar Cà Thẻ Đúp (`packages/financial/anomaly/duplicate_detector.py`)**:
   - Quét các giao dịch trên cùng thẻ ảo trong cửa sổ thời gian 48 giờ.
   - Phát hiện các trường hợp quẹt đúp nổi bật: **Facebook Ads ($150 x 2)** và **Grab Transport ($24.50 x 2)**.
2. **Radar Trễ Hạn Giải Ngân Payout (`packages/financial/reconciliation/payout_radar.py`)**:
   - Theo dõi SLA dòng tiền từ Payoneer, PayPal, Amazon, Stripe.
   - Tự động sinh mẫu đơn khiếu nại tra soát (Dispute Draft) với đầy đủ mã tham chiếu.
3. **Radar Subscription & Tăng Giá (`packages/financial/subscriptions/subscription_radar.py`)**:
   - Phát hiện biến động phí định kỳ (như Adobe CC tăng từ $49.99 lên $54.99).
4. **Engine Kiểm Tra Tính Xác Thực Giao Dịch (`packages/financial/security/authenticity_engine.py`)**:
   - Tính điểm mâu thuẫn bằng chứng (`Evidence Conflict Score: 0-100`).
   - Phát hiện ảnh chuyển khoản giả mạo (Fake Screenshot) không có bản ghi trong sổ cái.
5. **Cố Vấn Sức Khỏe Kinh Doanh (`packages/financial/advisory/business_advisor.py`)**:
   - Đánh giá chỉ số Unit Economics, tỷ lệ chi phí quảng cáo / doanh thu (ROAS), khuyến nghị chiến lược chi tiêu ads.

---

### 5. 📬 Email Alert Dispatcher Tự Động
- Tích hợp tại `packages/connectors/email_dispatcher.py` và `packages/agent/runtime/orchestrator.py`.
- Tự động gửi cảnh báo an toàn qua email khi phát hiện bất thường nghiêm trọng (Cà thẻ đúp, Payout quá hạn nghiêm trọng).

---

### 6. 🎨 Giao Diện Obsidian Fintech & Admin Bot Fleet Telemetry
- **Giao diện Obsidian Fintech (`apps/web/`)**:
  - Thiết kế hiện đại, bảng màu Slate/Emerald/Violet chuyên nghiệp, hỗ trợ đầy đủ Dark Mode & Light Mode.
  - Tích hợp **Song ngữ Anh - Việt (VI/EN)** toàn diện.
- **Phân định 2 chế độ ứng dụng (`AppMode`)**:
  1. **User Financial Copilot (`user`)**: Trợ lý AI hỏi đáp tài chính, tìm kiếm giao dịch, xem chi tiết bằng chứng đối soát.
  2. **Security Center (`ops`)**: Dành cho Quản trị viên / Đội ngũ Vận hành:
     - Giám sát sức khỏe thời gian thực của **12 Bot/Agent** trong hệ thống.
     - 5 thẻ chỉ số KPI: *Độ tin cậy hệ thống (99.8%), Tổng lượt gọi AI (128,450), Bot đang hoạt động (12/12), Tỷ lệ đối chiếu bằng chứng (100.0%), Tỷ lệ chặn vi phạm chính sách (1.2%)*.
     - Phân tích độ trễ phân vị (**P50, P90, P95, P99**) và phân bổ Intent.
     - Hàng đợi sự cố an ninh toàn hệ thống.

---

### 7. 📜 Tuyến Đường Xuất Nhật Ký Kiểm Toán (Audit Trail)
- API Route: `GET /api/v1/audit/export`
- Cho phép xuất toàn bộ nhật ký an toàn giao dịch dưới định dạng JSON phục vụ tuân thủ SOC2 / PCI-DSS.

---

## 🧪 4. KẾT QUẢ KIỂM THỬ & CHẤT LƯỢNG MÃ NGUỒN

| Hạng mục kiểm thử | Công cụ | Kết quả | Ghi chú |
|---|---|---|---|
| **Backend Unit & Integration Tests** | `pytest tests/ -v` | **25/25 PASSED (100%)** | Bao gồm API, RAG, Memory, Authenticity, Financial Radar, Bilingual |
| **Frontend TypeScript Typecheck** | `npx tsc --noEmit` | **0 Errors** | Đảm bảo tính toàn vẹn kiểu dữ liệu |
| **Live Chat API Test** | `curl /api/v1/chat` | **200 OK** | Trả về dữ liệu chuẩn từ file Excel chính thức |
| **Deterministic Guardrail Test** | `curl /api/v1/chat (transfer)` | **Blocked (Policy Allowed: False)** | Ngăn chặn an toàn các thao tác sửa đổi dòng tiền |

---

## 🛠️ 5. HƯỚNG DẪN CHẠY VÀ KIỂM TRA

### 1. Khởi động Backend API (FastAPI)
```bash
# Kích hoạt môi trường ảo Python
source .venv/bin/activate

# Chạy FastAPI server trên cổng 8000
python -m uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Khởi động Frontend Web (Next.js 14)
```bash
cd apps/web
npm install
npm run dev
# Truy cập tại: http://localhost:3000
```

### 3. Chạy toàn bộ Test Suite
```bash
.venv/bin/pytest tests/ -v
cd apps/web && npx tsc --noEmit
```

---

## 📦 6. CÁC TỆP TIN CỐT LÕI ĐÃ ĐƯỢC CHỈNH SỬA / BỔ SUNG TRÊN NHÁNH

- `packages/connectors/mock/mock_sources.py`: Trình nạp dữ liệu chính thức từ `wlf15_inbox_3users.xlsx` và CSVs.
- `packages/connectors/excel_inbox_connector.py`: Trình phân tích 148 email chính thức cho 3 user personas.
- `packages/agent/providers/llm_provider.py`: Bộ kết nối Live OpenRouter LLM (`openai/gpt-4o-mini`).
- `packages/agent/runtime/orchestrator.py`: Điều phối luồng xử lý AI, SessionMemory, FinancialRAG và EmailAlertDispatcher.
- `packages/agent/runtime/planner.py`: Trích xuất intent và merchant name thông minh.
- `packages/agent/tools/transactions.py`: Xử lý tìm kiếm giao dịch linh hoạt không bị lỗi stop-words.
- `packages/agent/rag/financial_rag.py`: Động cơ RAG đối chiếu chứng từ và luật Regulation E.
- `packages/agent/memory/session_memory.py`: Bộ nhớ ngữ cảnh hội thoại đa lượt.
- `apps/web/app/page.tsx`: Giao diện chính điều hướng User Copilot & Admin Security Center.
- `apps/web/components/ops/OpsDashboard.tsx`: Bảng điều khiển giám sát Bot Fleet Telemetry & Incident Queue.
- `apps/web/components/user/ChatInput.tsx`: Khung nhập liệu Chat AI tối ưu phím Enter và gợi ý nhanh.
- `apps/web/data/translations.ts`: Bộ từ điển song ngữ Việt - Anh.
- `apps/api/routes/audit.py`: Tuyến API xuất báo cáo kiểm toán an toàn tài chính.

---
*Tài liệu được khởi tạo và đồng bộ tự động vào nhánh **`integrate-main`**.*
