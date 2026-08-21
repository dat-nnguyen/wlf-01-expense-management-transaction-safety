.PHONY: setup dev dev-api dev-web test seed lint clean eval docker-build docker-up docker-down docker-logs

setup:
	pip install -r requirements.txt
	cd apps/web && npm install
	cp -n .env.example .env || true

dev-api:
	python -m uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000

dev-web:
	cd apps/web && npm run dev

dev:
	@echo "Khởi chạy song song Backend API (8000) và Web Dashboard (3000)..."
	python -m uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000

test-backend:
	@if [ -f .venv/bin/pytest ]; then .venv/bin/pytest tests/ -v; else pytest tests/ -v; fi

test-frontend:
	cd apps/web && npx tsc --noEmit

test: test-backend test-frontend

ci: test-backend test-frontend
	@echo "✅ All backend and frontend regression checks PASSED!"

seed:
	python scripts/seed.py

eval:
	python scripts/run_eval.py

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
