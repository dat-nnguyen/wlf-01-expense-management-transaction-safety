# 🛡️ Wealify Guardian — AI Expense Management & Transaction Safety Microservice

> **Wealify Hackathon (Track WLF-01) · Expense Management & Transaction Safety**  
> *An Enterprise AI Financial Copilot for Multi-Source Reconciliation, Virtual Card Risk Auditing, Duplicate Swipe Detection, Subscription Price Hike Tracking, and Regulatory US Regulation E Dispute Assistance.*

[![CI/CD Pipeline](https://github.com/dat-nnguyen/wlf-01-expense-management-transaction-safety/actions/workflows/ci.yml/badge.svg)](https://github.com/dat-nnguyen/wlf-01-expense-management-transaction-safety/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/pytest-40%2F40%20passed%20(100%25)-brightgreen.svg)](https://github.com/dat-nnguyen/wlf-01-expense-management-transaction-safety)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)
[![LLM Support](https://img.shields.io/badge/LLM-OpenRouter%20%7C%20Gemini%20%7C%20Deterministic-orange.svg)](https://openrouter.ai)

---

## 📖 Table of Contents
- [1. Introduction & Hackathon Problem (WLF-01)](#-1-introduction--hackathon-problem-wlf-01)
- [2. Design Philosophy & Financial Guardrails](#-2-design-philosophy--financial-guardrails)
- [3. Core Capabilities Addressing Hackathon Scenarios](#-3-core-capabilities-addressing-hackathon-scenarios)
- [4. System Architecture](#-4-system-architecture)
- [5. Quickstart Guide](#-5-quickstart-guide)
  - [1-Click Docker Compose Launch (Recommended)](#1-click-docker-compose-launch-recommended)
  - [Local Development Setup (Without Docker)](#local-development-setup-without-docker)
- [6. API Endpoints Reference](#-6-api-endpoints-reference)
- [7. Quality Assurance, Testing & CI/CD](#-7-quality-assurance-testing--cicd)
- [8. Repository Structure](#-8-repository-structure)
- [9. License](#-9-license)

---

## 🌟 1. Introduction & Hackathon Problem (WLF-01)

In cross-border business and enterprise operations, a single Wealify account handles multiple intertwined cashflow streams: **Pay-in** (incoming capital), **Payout** (e-commerce seller disbursements), **Transfer to Card** (allocations to virtual cards), **Service Fees**, and **Card Purchases / Digital Ad Spend**. These transactions are scattered across **Wealify Ledger Balances**, **Bank & Card Statements**, and **Email Inboxes (Invoices & Receipts)**.

**Wealify Guardian** is built as an intelligent, evidence-first AI Financial Copilot:
1. **3-Way Multi-Source Reconciliation**: Cross-checks Wealify account ledgers, card statements, and email receipts to detect cashflow leaks, unallocated card transfers, and missing seller disbursements (Amazon, Stripe, Shopify).
2. **Email Receipt Evidence Matching**: Extracts transaction IDs, amounts, dates, and sender authenticity from mailbox invoices to provide verified provenance for every line item.
3. **Virtual Card Duplicate Swipe Radar**: Identifies double-charges occurring within seconds or minutes and generates automated bank dispute drafts with **60-day US Regulation E statutory deadline tracking**.
4. **Subscription & Stealth Price Hike Radar**: Detects recurring billing cadences (Netflix, Adobe, OpenAI, Spotify), alerts users to price increases, and projects annual budget impacts.
5. **Expense & Fee Intelligence**: Aggregates monthly expenditures ($5,235.48 spending, $12.50 fees, Top 3 expenses) and dispatches automated financial reports to user email.
6. **Payment Screenshot / Fake Invoice Verification**: Verifies wire transfer screenshots against live database transactions to protect businesses against phishing and spoofed payment receipts.

---

## 🛡️ 2. Design Philosophy & Financial Guardrails

> **"LLM coordinates and interprets. Financial Engine calculates deterministically. Evidence proves provenance. Policy enforces safety boundaries. User retains final decision-making authority."**

The platform strictly enforces 7 foundational financial safety principles aligned with the WLF-01 contest rules:

1. **Strict Read-Only Boundary**:
   - The assistant strictly refuses all mutating financial commands (e.g., *"Cancel my Netflix subscription"*, *"Transfer $500 to card"*, *"Send a dispute email to the bank for me"*).
   - The system explains the security rationale and guides the user with clear instructions to perform the action safely in their banking app or provider portal.
2. **Tri-State Canonical Classification**:
   - `① Định kỳ đã xác định (Confirmed Recurring)`: Recurring charge backed by historical pattern and matching email invoice evidence.
   - `② Cần bạn tự xác nhận (Needs User Confirmation)`: Anomalous charges, potential double-swipes, or price hikes. The system never makes unverified claims of "100% fraud".
   - `③ Chưa đủ dữ liệu (Insufficient Data)`: Unreconciled transactions lacking secondary source evidence.
3. **60-Day US Regulation E Statutory Dispute Deadlines**:
   - All suspicious or duplicate charges feature an interactive countdown timer reminding users of the 60-day legal dispute window under US banking regulations.
4. **Discrepancy Invariant Formula**:
   - For unlinked transfers or missing card balances, the system strictly outputs the objective formulation:  
     `"Lệch $X giữa [Source A] và [Source B] — chưa xác định nguyên nhân."`  
     (*"Discrepancy of $X between [Source A] and [Source B] — cause undetermined."*)
5. **Unknown Merchant Normalization**:
   - Unrecognized transaction descriptors are normalized to `"Chưa xác định được"` (*"Undetermined"*).
6. **No False Absolute Safety Assurances**:
   - When asked *"Is my account safe?"*, the system transparently answers:  
     *"Hệ thống chỉ có thể chỉ ra những giao dịch có dấu hiệu cần kiểm tra dựa trên dữ liệu hiện có, không đưa ra kết luận an toàn tuyệt đối."*  
     (*"The system can only highlight transactions with potential risk indicators based on current data, and does not provide an absolute safety guarantee."*)
7. **Bilingual Support (Vietnamese & English)**:
   - Automatically detects user language and formats financial responses with markdown tables and badges.

---

## 🎯 3. Core Capabilities Addressing Hackathon Scenarios

| # | Contest Scenario (WLF-01) | Engine / Tool | System Output & Resolution |
|---|---|---|---|
| **1** | **Monthly Expense & Fee Breakdown** | `generate_expense_report` | Aggregates Total Spend (**$5,235.48**), Total Fees (**$12.50**), and Top 3 Expenses (MSB Bank Transfer $5,350.00, Landlord Rent $1,200.00, Google $420.00). |
| **2** | **$9.99 Charge & Email Matching** | `search_transactions` + `search_emails` | Identifies **$9.99** Netflix on Card Statement #21 matched at **96% confidence** with Email Invoice #104 from `billing@netflix.com`, labeled as `① Confirmed Recurring`. |
| **3** | **3-Way Reconciliation (Missing Card Transfer)** | `reconcile_transactions` | Pinpoints **$5,350.00** debited from Account on 18/08/2026 but unrecorded on Virtual Card: *"Lệch $5,350.00 giữa Account và Card Statement — chưa xác định nguyên nhân."* |
| **4** | **Subscription Radar & Price Hike Alert** | `find_subscriptions` | Catalogs active subscriptions (Netflix $9.99, Adobe $54.99, OpenAI $20.00); highlights **Adobe increase from $49.99 to $54.99 (+10%)** with **+$60.00/yr** budget impact forecast. |
| **5** | **Multi-Card Duplicate Swipe Detection** | `find_duplicates` | Catches 2 swipes of **$75.00** at Volcano Ads within 105 seconds, labeled `② Needs User Confirmation`, with 60-day dispute countdown & pre-filled bank dispute draft. |
| **6** | **Automated Email Report Dispatch** | `dispatch_email_report` | Compiles comprehensive financial breakdown and dispatches report directly to user's registered inbox. |

---

## 🏗️ 4. System Architecture

```mermaid
flowchart TB
    subgraph Frontend["🖥️ Next.js 15 Management Dashboard (Port 3001)"]
        UI[Copilot Chat • Anomaly Radar • 3-Way Reconcile Matrix • Evidence Explorer]
    end

    subgraph API["⚡ FastAPI Microservice Backend (Port 8001)"]
        Guard[Input & Policy Guardrails<br/>- Read-Only Security Boundary<br/>- Mutation Blocker]
        Planner[Intent & Context Planner]
        Engine[Deterministic Financial Engine<br/>- 3-Way Reconciliation Matrix<br/>- Duplicate Swipes Radar<br/>- Subscription & Hike Radar<br/>- Payout & SLA Tracker]
        LLM[LLM Adapter Layer<br/>- OpenRouter GPT-4o-mini<br/>- Google Gemini 2.0 Flash<br/>- Deterministic Synthesizer]
    end

    subgraph Data["💾 Persistent Storage & Connectors"]
        DB[(PostgreSQL 16 / SQLite)]
        Excel[Excel Inbox Connector: emails.xlsx]
        CSV[Card Statements & Bank Ledgers]
    end

    UI <-->|REST API / JSON| API
    Guard --> Planner
    Planner --> Engine
    Engine --> Data
    Engine --> LLM
    LLM --> UI
```

---

## 🚀 5. Quickstart Guide

### 1-Click Docker Compose Launch (Recommended)

The microservice stack runs in **3 isolated containers**:
1. **PostgreSQL Database** (Host port `:5433` / Container port `:5432`)
2. **FastAPI Backend Microservice** (Host port `:8001` / Container port `:8000`)
3. **Next.js Web Management Dashboard** (Host port `:3001` / Container port `:3000`)

#### Step 1: Prepare `.env` configuration
Create a `.env` file in the root directory (safely ignored by `.gitignore`):
```bash
# LLM Provider: "openrouter", "gemini", or "mock" (offline fallback)
LLM_PROVIDER=openrouter
LLM_MODEL=openai/gpt-4o-mini

# API Keys (Stored securely in .env)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
# GEMINI_API_KEY=your-gemini-api-key

# Database Configuration
POSTGRES_USER=wealify
POSTGRES_PASSWORD=wealify_secure_pwd
POSTGRES_DB=wealify_guardian
DATABASE_URL=postgresql://wealify:wealify_secure_pwd@postgres:5432/wealify_guardian
```

#### Step 2: Build and run the containers
```bash
# Build images and run containers in detached mode
docker compose up --build -d
```

#### Step 3: Access the platform
- 🖥️ **Web Management Dashboard**: [http://localhost:3001](http://localhost:3001)
- 📚 **FastAPI Swagger Interactive Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)
- 🩺 **Healthcheck Endpoint**: [http://localhost:8001/health](http://localhost:8001/health)

#### Step 4: View logs or shut down
```bash
# Stream API container logs in real-time
docker compose logs -f api

# Gracefully stop all containers
docker compose down
```

---

### Local Development Setup (Without Docker)

#### Step 1: Install Python & Node.js dependencies
```bash
# Setup Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python requirements
pip install -r requirements.txt

# Install Next.js frontend requirements
cd apps/web && npm install && cd ../..
```

#### Step 2: Launch Backend API and Frontend App
```bash
# Terminal 1: Start FastAPI Backend (Port 8000)
python -m uvicorn apps.api.main:app --reload --port 8000

# Terminal 2: Start Next.js Web Dashboard (Port 3000)
cd apps/web && npm run dev
```

---

## 📡 6. API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chat` | Main conversational endpoint with AI Copilot (reasoning, reconciliation, reports). |
| `GET` | `/api/v1/alerts` | Fetches active financial risk alerts (double swipes, price hikes, overdue payouts). |
| `GET` | `/api/v1/reports/monthly` | Computes monthly category breakdowns, total spend, fees, and net cashflow. |
| `GET` | `/api/v1/reconcile` | Executes 3-way reconciliation across Account Ledger, Card Statement, and Invoices. |
| `POST` | `/api/v1/verify-authenticity` | Validates wire transfer receipt authenticity against live ledger records. |
| `GET` | `/health` | Liveness and database connectivity healthcheck. |

---

## 🧪 7. Quality Assurance, Testing & CI/CD

The repository is safeguarded by an automated suite of **40 Unit and Integration Tests** covering 100% of financial calculations, policy boundaries, adversarial inputs, and bilingual interactions:

```bash
# Run the complete test suite with Pytest
APP_ENV=test pytest tests/ -v
```

### Verified Test Suite Execution Output (40/40 PASSED):
```text
tests/integration/test_api.py::test_health_check PASSED                  [  2%]
tests/integration/test_api.py::test_list_transactions PASSED             [  5%]
tests/integration/test_api.py::test_chat_duplicate_query PASSED          [  7%]
tests/integration/test_api.py::test_chat_disallowed_transfer PASSED      [ 10%]
tests/integration/test_api.py::test_alerts_endpoint PASSED               [ 12%]
tests/integration/test_api.py::test_monthly_report_endpoint PASSED       [ 15%]
tests/unit/test_3way_and_email_reconciliation.py::test_3way_reconciliation_rules PASSED [ 17%]
tests/unit/test_3way_and_email_reconciliation.py::test_email_reconciliation_matching PASSED [ 20%]
tests/unit/test_adversarial_safety.py::test_adversarial_account_safety_inquiry PASSED [ 22%]
tests/unit/test_adversarial_safety.py::test_adversarial_cancel_subscription_refusal PASSED [ 25%]
tests/unit/test_adversarial_safety.py::test_adversarial_transfer_money_refusal PASSED [ 27%]
tests/unit/test_adversarial_safety.py::test_adversarial_send_email_to_bank_refusal PASSED [ 30%]
tests/unit/test_adversarial_safety.py::test_10_business_questions PASSED [ 32%]
tests/unit/test_authenticity_engine.py::test_authenticity_engine_fake_screenshot_no_ledger_match PASSED [ 35%]
tests/unit/test_authenticity_engine.py::test_authenticity_engine_legitimate_settlement_match PASSED [ 37%]
tests/unit/test_authenticity_engine.py::test_authenticity_engine_parse_from_text PASSED [ 40%]
tests/unit/test_authenticity_engine.py::test_security_case_read_only_status_update PASSED [ 42%]
tests/unit/test_bilingual.py::test_bilingual_policy_denial PASSED        [ 45%]
tests/unit/test_confidence.py::test_confidence_perfect_match PASSED      [ 47%]
tests/unit/test_confidence.py::test_confidence_no_email PASSED           [ 50%]
tests/unit/test_financial_engine.py::test_classify_transaction PASSED    [ 52%]
tests/unit/test_financial_engine.py::test_duplicate_detector_virtual_cards PASSED [ 55%]
tests/unit/test_financial_engine.py::test_subscription_radar_detection_and_price_hike PASSED [ 57%]
tests/unit/test_financial_engine.py::test_payout_radar_overdue_detection PASSED [ 60%]
tests/unit/test_business_advisor_unit_economics PASSED [ 62%]
tests/unit/test_memory_and_rag.py::test_session_memory_retention PASSED  [ 65%]
tests/unit/test_memory_and_rag.py::test_financial_rag_merchant_disambiguation PASSED [ 67%]
tests/unit/test_memory_and_rag.py::test_financial_rag_dispute_regulation PASSED [ 70%]
tests/unit/test_memory_and_rag.py::test_financial_rag_email_evidence PASSED [ 72%]
tests/unit/test_parsers.py::test_merchant_normalizer_and_explainer PASSED [ 75%]
tests/unit/test_parsers.py::test_transaction_type_classification PASSED  [ 77%]
tests/unit/test_parsers.py::test_csv_parser_classification PASSED        [ 80%]
tests/unit/test_policy.py::test_policy_engine_allowed_actions PASSED     [ 82%]
tests/unit/test_policy.py::test_policy_engine_strictly_denied_actions PASSED [ 85%]
tests/unit/test_policy.py::test_input_guardrail_blocks_mutation_queries PASSED [ 87%]
tests/unit/test_reminders_and_monitor.py::test_reminder_tracker_60_day_deadline PASSED [ 90%]
tests/unit/test_reminders_and_monitor.py::test_proactive_monitor_deduplication PASSED [ 92%]
tests/unit/test_spending_surge.py::test_spending_surge_radar_detection PASSED [ 95%]
tests/unit/test_spending_surge.py::test_agent_spending_surge_inquiry PASSED [ 97%]
tests/unit/test_spending_surge.py::test_agent_spending_surge_inquiry_english PASSED [100%]
======================== 40 passed, 1 warning in 21.72s ========================
```

### Run Live Chat Queries Test Script:
```bash
python scripts/test_chat_queries.py
```

---

## 📁 8. Repository Structure

```text
├── apps/
│   ├── api/                   # FastAPI microservice REST API
│   │   ├── main.py            # API entrypoint, CORS, lifespan handler
│   │   ├── dependencies.py    # Dependency injection container
│   │   └── routes/            # Chat, Alerts, Reconcile, Reports, HITL
│   └── web/                   # Next.js 15 Management Dashboard
│       ├── app/               # App router (page.tsx, layout.tsx, globals.css)
│       └── components/        # Copilot Chat, 3-Way Reconcile Matrix, Evidence Matrix
│
├── packages/
│   ├── agent/                 # Agent Runtime, Intent Planner, Guardrails, Tools, LLM Providers
│   │   ├── guardrails/        # Read-Only & Disallowed Mutation Filters
│   │   ├── runtime/           # Agent Orchestrator & Intent Planner
│   │   ├── tools/             # Financial Query, Reconcile, Subscription, Duplicate Tools
│   │   └── providers/         # OpenRouter (GPT-4o-mini), Gemini & Mock Synthesizers
│   ├── financial/             # Deterministic Financial Logic (3-Way Reconciler, Radar)
│   ├── data/                  # Pydantic Schemas, Excel/CSV Parsers, Normalizers
│   ├── policy/                # Read-Only Policies & Permission Matrix
│   ├── evidence/              # Multi-Signal Confidence Calculator
│   └── connectors/            # Excel Inbox Connector & Virtual Card DB Adapters
│
├── scripts/
│   ├── test_chat_queries.py   # Test runner for 11 business & adversarial queries
│   └── seed.py                # Database initial seed script
│
├── tests/                     # 40 Unit & Integration Test Suites
│   ├── integration/           # REST API endpoints verification
│   └── unit/                  # Financial logic, guardrails, and calculations
│
├── .github/workflows/ci.yml   # GitHub Actions CI/CD Pipeline
├── docker-compose.yml         # Multi-container orchestration (Postgres + API + Web)
├── Dockerfile                 # Backend FastAPI Dockerfile
├── requirements.txt           # Python dependencies list
└── README.md                  # Project documentation
```

---

## 📄 9. License

This project is open-source software licensed under the **MIT License**.
