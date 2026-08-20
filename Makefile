.PHONY: setup dev test seed lint clean eval

setup:
	pip install -r requirements.txt
	cp -n .env.example .env || true

dev:
	python -m uvicorn apps.api.main:app --reload --host 0.0.0.0 --port 8000

test:
	python -m pytest tests/ -v

seed:
	python scripts/seed.py

eval:
	python scripts/run_eval.py

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
