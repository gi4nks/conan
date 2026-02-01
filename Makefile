.PHONY: help install dev build start lint clean docker-build docker-up docker-down

# Default goal
help:
	@echo "Conan - Investigative Tool CLI"
	@echo ""
	@echo "Usage:"
	@echo "  make dev             Start development server"
	@echo "  make install         Install dependencies"
	@echo "  make build           Build the application"
	@echo "  make start           Start production server"
	@echo "  make lint            Run linter"
	@echo "  make clean           Remove build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up       Start docker-compose"
	@echo "  make docker-down     Stop docker-compose"
	@echo "  make docker-build    Build docker image"

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
