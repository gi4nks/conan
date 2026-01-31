.PHONY: help install dev build start lint clean docker-build docker-up docker-down

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start the development server"
	@echo "  make build        - Build the application for production"
	@echo "  make start        - Start the production server"
	@echo "  make lint         - Run ESLint"
	@echo "  make clean        - Remove build artifacts and node_modules"
	@echo "  make docker-build - Build docker image"
	@echo "  make docker-up    - Start docker containers"
	@echo "  make docker-down  - Stop docker containers"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

clean:
	rm -rf .next node_modules local.db*

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down