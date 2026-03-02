SHELL := /bin/sh

.PHONY: help dev dev-bg dev-down obs obs-bg obs-down prod prod-down quality lint check format format-check build db-generate db-migrate k8s-apply k8s-delete

help:
	@echo "Targets:"
	@echo "  dev          Start local dev stack (hot reload)"
	@echo "  dev-bg       Start local dev stack in background"
	@echo "  dev-down     Stop local dev stack"
	@echo "  obs          Start dev stack + observability (Prometheus/Grafana/Tempo)"
	@echo "  obs-bg       Start dev stack + observability in background"
	@echo "  obs-down     Stop dev stack + observability"
	@echo "  prod         Start production-like stack"
	@echo "  prod-down    Stop production-like stack"
	@echo "  quality      Run format:check + lint + typecheck"
	@echo "  format       Format repository files"
	@echo "  lint         Run backend/frontend lint"
	@echo "  check        Run backend/frontend typecheck"
	@echo "  build        Run backend/frontend build"
	@echo "  db-generate  Generate Drizzle migration files (backend)"
	@echo "  db-migrate   Apply Drizzle migrations (backend)"
	@echo "  k8s-apply    Apply Kubernetes manifests in order"
	@echo "  k8s-delete   Delete platform-lab namespace"

dev:
	cd infra && docker compose up --build

dev-bg:
	cd infra && docker compose up --build -d

dev-down:
	cd infra && docker compose down

obs:
	cd infra && docker compose -f docker-compose.yml -f docker-compose.observability.yml up --build

obs-bg:
	cd infra && docker compose -f docker-compose.yml -f docker-compose.observability.yml up --build -d

obs-down:
	cd infra && docker compose -f docker-compose.yml -f docker-compose.observability.yml down

prod:
	cd infra && docker compose -f docker-compose.prod.yml up --build -d

prod-down:
	cd infra && docker compose -f docker-compose.prod.yml down

quality:
	npm run quality

lint:
	npm run lint

check:
	npm run check

format:
	npm run format

format-check:
	npm run format:check

build:
	npm run build

db-generate:
	cd backend && npm run db:generate

db-migrate:
	cd backend && npm run db:migrate

k8s-apply:
	kubectl apply -f infra/k8s/namespace.yaml
	kubectl apply -f infra/k8s/postgres.yaml
	kubectl apply -f infra/k8s/api.yaml
	kubectl apply -f infra/k8s/frontend.yaml

k8s-delete:
	kubectl delete namespace platform-lab --ignore-not-found
