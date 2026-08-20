# Wealify Guardian — AI Expense Management & Transaction Safety Copilot

> **Empowering users to understand, reconcile, and protect their cash flow through deterministic financial intelligence and safe agentic assistance.**

---

## 🌟 Overview

**Wealify Guardian** is an AI-powered financial assistant and multi-source reconciliation copilot. Rather than acting as an unconstrained autonomous financial bot, Wealify Guardian is built on a strict, evidence-first architectural principle:

> **LLM understands and coordinates. Financial Engine calculates. Evidence proves. Policy controls. User decides.**

The system actively monitors personal and business expenditures, identifies duplicate charges, detects recurring subscription renewals and unexpected price hikes, performs multi-source ledger reconciliation (Bank Accounts ↔ Digital Wallets ↔ Credit Cards ↔ Email Receipts), and provides transparent evidence for every insight.

---

## 🛡️ Core Capabilities & Features

### 1. Multi-Source Financial Reconciliation
- Cross-references ledgers across **Bank Accounts**, **Digital Wallets**, and **Credit Cards**.
- Identifies un-reconciled fund movements (e.g., transfers debited from a bank account that never arrived in a wallet).
- Matches card transactions with email receipts to verify transaction legitimacy.

### 2. Anomaly & Duplicate Charge Detection
- Identifies duplicate billings and accidental multiple charges within customizable time windows (e.g., 48 hours).
- Provides actionable dispute deadlines (e.g., 60-day standard dispute window).

### 3. Subscription Radar & Price Hike Detection
- Automatically identifies recurring weekly, monthly, and yearly subscription cadences (e.g., Netflix, Spotify, Adobe, cloud services).
- Detects unexpected price changes between billing cycles and calculates estimated annual commitments.

### 4. Evidence-First Transparency & Confidence Scoring
- Every alert and recommendation is backed by verifiable structured evidence (statement lines, email receipts, timestamps).
- Multi-factor deterministic confidence scoring (Amount match, Date proximity, Merchant match, Receipt semantic check).
- Uses three standardized, unambiguous status classifications:
  - **Định kỳ đã xác định** (Confirmed Recurring)
  - **Cần bạn tự xác nhận** (Needs User Confirmation)
  - **Chưa đủ dữ liệu** (Insufficient Data)

### 5. Strict Read-Only Safety & Policy Guardrails
- **Zero Financial Mutation**: Tools for transferring money, canceling accounts, or initiating unverified actions are blocked at the engine level.
- **Human-in-the-Loop**: High-impact actions (such as dispatching report drafts to verified user emails) require explicit confirmation.

---

## 🏗️ System Architecture

```text
                        ┌─────────────────────────┐
                        │       Next.js Web       │
                        │ Chat / Alerts / Reports │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │    FastAPI Gateway      │
                        │    /api/v1 Endpoints    │
                        └────────────┬────────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             ▼                       ▼                       ▼
   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
   │   Agent Runtime   │   │  Financial Core   │   │   Data Platform   │
   │  Guardrails       │   │  Reconciliation   │   │  Canonical Schema │
   │  Intent Planner   │   │  Duplicate Radar  │   │  Parsers (CSV/EML)│
   │  Tool Registry    │   │  Subscription     │   │  Normalizer       │
   │  Safe Executor    │   │  Metrics Engine   │   │  Connectors       │
   └─────────┬─────────┘   └─────────┬─────────┘   └─────────┬─────────┘
             │                       │                       │
             └───────────────────────┼───────────────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │      Evidence Layer     │
                        │  Confidence Calculator  │
                        │    Provenance Builder   │
                        └────────────┬────────────┘
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │   Storage & Audit Log   │
                        │  PostgreSQL / SQLite    │
                        └─────────────────────────┘
```

---

## 📁 Project Structure

```text
├── apps/
│   ├── api/                   # FastAPI application & REST endpoints
│   │   ├── main.py            # API entrypoint, CORS, lifespan
│   │   ├── dependencies.py    # Service and dependency injection
│   │   └── routes/            # Chat, Transactions, Reconciliation, Alerts, Reports
│   └── web/                   # Next.js frontend application
│
├── packages/
│   ├── agent/                 # Agent Runtime, Intent Planner, Tools, Guardrails, Providers
│   ├── financial/             # Deterministic Financial & Reconciliation Engine
│   ├── data/                  # Canonical schemas, Statement & Email parsers, Normalizers
│   ├── policy/                # Read-only Policy Engine & Security Boundaries
│   ├── evidence/              # Evidence builder & multi-signal confidence calculator
│   ├── connectors/            # Mock and external data source adapters
│   ├── db/                    # SQLAlchemy models, repositories, and database sessions
│   └── observability/         # Structured logging, metrics, and LLM telemetry
│
├── data/
│   └── sample/                # Sample datasets for bank accounts, cards, and emails
│
├── scripts/
│   ├── seed.py                # Database seeding script
│   └── run_eval.py            # Agent evaluation runner
│
├── tests/
│   ├── unit/                  # Unit tests for financial logic, policy, and confidence
│   └── integration/           # Integration tests for FastAPI endpoints
│
├── docker-compose.yml         # Container configuration (PostgreSQL + API)
├── Makefile                   # Developer convenience CLI commands
├── pyproject.toml             # Python project configuration
└── requirements.txt           # Dependency requirements
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (optional, for containerized deployment)

### 1. Installation

Clone the repository and install backend dependencies:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create local environment config
cp .env.example .env
```

### 2. Seed Database

Populate sample transactions and statement records:

```bash
python scripts/seed.py
```

### 3. Run the Backend API

Start the FastAPI development server:

```bash
python -m uvicorn apps.api.main:app --reload --port 8000
```

- **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Healthcheck**: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Run Automated Tests & Evaluations

```bash
# Run unit & integration test suite
python -m pytest tests/ -v

# Run agent evaluations
python scripts/run_eval.py
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | FastAPI, Uvicorn, Pydantic v2 |
| **Data Engine & ORM** | SQLAlchemy, Pandas |
| **Agent & Policy** | Python custom orchestrator, Policy Engine, Multi-signal confidence |
| **Database** | SQLite (local zero-config) / PostgreSQL (production) |
| **Testing** | Pytest, Pytest-AsyncIO, FastAPI TestClient |
| **Frontend** | Next.js, React, Tailwind CSS |

---

## 📄 License

This project is licensed under the MIT License.
