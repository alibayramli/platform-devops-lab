# Platform + DevOps Learning Lab

`Team Task Hub` is a practical fullstack app for groups to manage shared tasks, assignees, and progress.
It is intentionally designed to be simple enough to learn from, but structured enough to scale.

## Product Scope

- Team workspaces
- Team members with roles (`lead`, `member`, `observer`)
- Task management with:
  - status (`todo`, `in_progress`, `blocked`, `done`)
  - priority (`low`, `medium`, `high`)
  - due dates
  - assignees
- Team-level summary dashboard (tasks and member counts)

## Architecture

- `backend/`
  - Express + TypeScript + PostgreSQL + Drizzle ORM
  - Feature modules (`teams`, `members`, `tasks`, `health`)
  - Layered flow per module: `routes -> service -> repository`
  - Zod request validation
  - Shared error handling middleware
- `frontend/`
  - React + TypeScript + Vite
  - Feature-first folders (`teams`, `members`, `tasks`)
  - React Query for server-state management
  - Typed API client
- `infra/`
  - `docker-compose.yml` for local multi-service stack
  - `k8s/` starter manifests for Kubernetes practice
- `.github/workflows/ci.yml`
  - Lint + Typecheck + Build for backend and frontend

## Quality Standards

- Strict TypeScript in backend and frontend
- ESLint + Prettier in both apps
- CI validates lint/check/build on push and pull request

## Quick Start (Docker)

1. Install prerequisites:
   - Node.js 24
   - Docker Desktop
2. Align your local Node version:

```bash
nvm use
```

3. Start all services (development mode with hot reload):

```bash
cd infra
docker compose up --build
```

4. Open:
   - Frontend: http://localhost:3000
   - API health: http://localhost:8080/health

## Production-Like Local Run (Docker)

Use this when you want production runtime behavior (no source bind mounts/hot reload):

```bash
cd infra
docker compose -f docker-compose.prod.yml up --build -d
```

## Observability Lab

This repo includes a local observability stack so you can practice metrics, traces, and logs end-to-end:

- Metrics: Prometheus scrapes API `/metrics`
- Traces: OpenTelemetry (API) -> OTel Collector -> Tempo
- Dashboards/Explore: Grafana
- Logs: structured JSON logs from API container

Run it:

```bash
make obs
```

Background mode:

```bash
make obs-bg
```

Stop it:

```bash
make obs-down
```

Endpoints:

- Frontend: http://localhost:3000
- API: http://localhost:8080
- API metrics: http://localhost:8080/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (`admin` / `admin`)
- Tempo readiness: http://localhost:3200/ready

Notes:

- Grafana includes a preprovisioned `Platform DevOps Lab Overview` dashboard.

Hands-on guide: [docs/observability-lab.md](docs/observability-lab.md)

## Local Development (No Docker)

1. Start PostgreSQL and set `DATABASE_URL` in `backend/.env` (copy from `.env.example`).
2. Backend:

```bash
cd backend
npm install
npm run dev
```

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Commands

- Backend
  - `npm run dev`
  - `npm run lint`
  - `npm run check`
  - `npm run build`
- Frontend
  - `npm run dev`
  - `npm run lint`
  - `npm run check`
  - `npm run build`
- Repo quality
  - `npm install` (at repo root, once)
  - `npm run format`
  - `npm run lint`
  - `npm run check`
  - `npm run quality`
- Makefile shortcuts
  - `make dev`
  - `make prod`
  - `make obs`
  - `make obs-bg`
  - `make obs-down`
  - `make quality`
  - `make db-generate`
  - `make db-migrate`

## Shared Code Style Guardrails

- `.editorconfig`, `.prettierrc.json`, and `.gitattributes` enforce shared text and formatting behavior.
- Husky Git hooks are enabled from the repo root:
  - `pre-commit`: `lint-staged` (format staged files) + lint.
  - `pre-push`: type checks.
- CI also validates formatting with `npm run format:check`.

## Next Learning Steps

- [docs/learning-path.md](docs/learning-path.md)
- [docs/free-setup-2026-03-02.md](docs/free-setup-2026-03-02.md)
