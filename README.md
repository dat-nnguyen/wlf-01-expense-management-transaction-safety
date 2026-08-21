# Wealify Guardian — AI Expense Management & Transaction Safety Microservice

> **Enterprise AI Financial Assistant & Transaction Safety Copilot for Wealify**  
> Empowering cross-border merchants and businesses to protect virtual cards, detect overdue payouts, monitor subscription price hikes, and optimize business unit economics.

---

## 🌟 Overview

**Wealify Guardian** is an enterprise AI financial assistant and multi-source transaction safety microservice. Rather than acting as an unconstrained autonomous financial bot, Wealify Guardian is built on a strict, evidence-first architectural principle:

> **LLM understands and coordinates. Financial Engine calculates. Evidence proves. Policy controls. User decides.**

The system actively monitors virtual card spendings across Vietnamese and International banks, identifies duplicate charges, detects recurring subscription price hikes, reconciles e-commerce seller disbursements (Amazon, Stripe, Shopify, TikTok Shop), performs multi-source ledger reconciliation, and provides business unit economics advisory.

---

## 🛡️ Core Capabilities & Features

### 1. 🚨 Overdue / Missing E-Commerce Payout Radar
- Automatically cross-checks seller payout confirmation emails (Amazon Seller Central, Stripe, Shopify, TikTok Shop, Etsy, PayPal) against received bank/wallet deposits.
- Detects discrepancies exceeding platform settlement SLA (e.g. Amazon 3 days, Stripe 2 days, or critical 14–16+ day delays).
- Generates pre-filled dispute email and ticket drafts (`dispute_draft`) with reference IDs.

### 2. 💳 Multi-Bank Virtual Card Double-Charge Radar
- Monitors virtual cards issued across multiple local (Vietcombank, Techcombank, VPBank) and international banks.
- Detects duplicate charges (e.g., Facebook Ads, Google Ads, ride-hailing fees) within customizable time windows.
- Attaches standard **60-day bank dispute deadline countdown** and pre-filled dispute templates.

### 3. 📈 SaaS Subscription Radar & Stealth Price Hike Detection
- Automatically identifies recurring weekly, monthly, and yearly cadences (Adobe, OpenAI ChatGPT, Netflix, Canva, AWS).
- Detects stealth price increases and forecasts annual budget impact.

### 4. 🔍 Grounding & Self-Reflection Verification Engine
- Dual-Engine pipeline: Python deterministic financial engine + DeepSeek Reasoner self-reflection check.
- Validates 100% of numerical and merchant claims against ledger ground truth before sending responses, eliminating hallucination.
- Standardized tri-state classification: `Định kỳ đã xác định`, `Cần bạn tự xác nhận`, `Chưa đủ dữ liệu`.

### 5. 📊 Business Financial Health & Unit Economics Advisory
- Evaluates Ad Spend on Virtual Cards vs E-Commerce Payout revenues to compute **ROAS**, Net Margin, and Burn Rate.
- Identifies cashflow squeeze risks when payouts are delayed while ad campaigns continue spending.
- **Human-in-the-Loop (HITL)**: Provides actionable 1-click recommendations (e.g. Pause ad campaigns, dispute payout delays).

### 6. 🖥️ Management Dashboard (Next.js App)
- Live AI Copilot with real-time **DeepSeek Reasoning Trace** (`RECEIVED` → `PLANNING` → `TOOL_EXECUTION` → `GROUNDING_REFLECTION` → `COMPLETED`).
- Comprehensive Anomaly Center, Business Health Panel, HITL Review Queue, and Append-Only Audit Trail.

---

## 🐳 Docker Quickstart (Khởi Chạy 1-Click Bằng Docker)

Hệ thống được đóng gói hoàn chỉnh gồm **3 Container**:
1. **PostgreSQL Database** (`:5432`)
2. **FastAPI Microservice Backend** (`:8000`)
3. **Next.js Web Management Dashboard** (`:3000`)

### 1. Khởi chạy toàn bộ hệ thống bằng Docker Compose:

```bash
# Build và chạy ngầm toàn bộ 3 containers
docker compose up --build -d

# Hoặc dùng lệnh make
make docker-up
```

### 2. Truy cập ứng dụng:
- 🖥️ **Management Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- 📚 **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🩺 **Healthcheck Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Xem logs và Dừng Docker:

```bash
# Xem logs thời gian thực
docker compose logs -f

# Dừng toàn bộ hệ thống
docker compose down
```

---

## 💻 Chạy Trực Tiếp Không Cần Docker (Local Development)

### 1. Cài đặt môi trường

```bash
# Cài đặt thư viện Python
pip install -r requirements.txt

# Cài đặt thư viện Frontend
cd apps/web && npm install && cd ../..

# Tạo file cấu hình môi trường
cp .env.example .env
```

### 2. Khởi chạy Backend API & Web Dashboard

```bash
# Terminal 1: Chạy Backend FastAPI (Port 8000)
python -m uvicorn apps.api.main:app --reload --port 8000

# Terminal 2: Chạy Web Dashboard Next.js (Port 3000)
cd apps/web && npm run dev
```

### 3. Chạy Bộ Kiểm Thử Tự Động (Unit & Evaluation Tests)

```bash
# Chạy Unit Tests (10/10 Passed)
pytest tests/unit/ -v

# Chạy Agent Evaluation Suite (6/6 Passed - 100%)
python scripts/run_eval.py
```

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```text
├── apps/
│   ├── api/                   # FastAPI microservice application & REST endpoints
│   │   ├── main.py            # API entrypoint, CORS, lifespan
│   │   ├── dependencies.py    # Service & repo injection
│   │   └── routes/            # Chat, Alerts, Reconciliation, Advisory, HITL, Reports
│   └── web/                   # Next.js Management Dashboard
│       ├── app/               # App Router: page.tsx, layout.tsx, globals.css
│       └── Dockerfile         # Multi-stage optimized Docker build for Frontend
│
├── packages/
│   ├── agent/                 # Agent Runtime, Intent Planner, Tools, Guardrails, Providers
│   ├── financial/             # Deterministic Financial Engine (PayoutRadar, DuplicateDetector, Subscriptions, Advisory)
│   ├── data/                  # Canonical schemas, Parsers (CSV/JSON), Normalizers
│   ├── policy/                # Read-only Policy Engine & Security Boundaries
│   ├── evidence/              # Evidence builder & multi-signal confidence calculator
│   ├── connectors/            # Mock and external data source adapters
│   ├── db/                    # SQLAlchemy models, repositories, and sessions
│   └── observability/         # Structured logging, metrics, and token telemetry
│
├── data/
│   └── sample/                # Sample datasets: emails.json, card_statements.csv, account_transactions.csv
│
├── scripts/
│   ├── seed.py                # Database seeding script
│   └── run_eval.py            # Enterprise AI evaluation runner
│
├── tests/
│   └── unit/                  # Unit tests for financial logic, policy, and confidence
│
├── docker-compose.yml         # Container orchestration (PostgreSQL + API + Web Dashboard)
├── Dockerfile                 # Backend FastAPI container configuration
├── Makefile                   # Developer CLI shortcuts
├── pyproject.toml             # Python project configuration
└── requirements.txt           # Python dependencies
```

---

## 📄 Giấy Phép (License)

Dự án được phát hành theo giấy phép **MIT License**.
