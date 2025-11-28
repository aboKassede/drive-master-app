.PHONY: install dev test lint format run docker-build docker-run

install:
	pip install -r requirements/base.txt

dev:
	pip install -r requirements/dev.txt

test:
	pip install -r requirements/test.txt
	pytest

lint:
	flake8 app/
	mypy app/

format:
	black app/

run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

docker-build:
	docker build -t driving-school-backend .

docker-run:
	docker run -p 8000:8000 driving-school-backend