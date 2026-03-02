# Observability Lab (From Scratch)

This guide is intentionally beginner-friendly but follows real production patterns.

## 1) Core idea: where observability lives

- Instrumentation belongs in the **application** (logs, metrics, traces).
- Collection/aggregation belongs in the **platform** (Docker or Kubernetes runtime).
- In Kubernetes, you additionally collect **pod/node/control-plane** signals.

Short version:

- Docker-only app: app instrumentation + container runtime logs/metrics.
- Kubernetes app: same app instrumentation + pod/node/cluster telemetry.

## 2) Start the lab

From repo root:

```bash
make obs
```

Or run in background:

```bash
make obs-bg
```

Services:

- Frontend: http://localhost:3000
- API: http://localhost:8080
- API metrics: http://localhost:8080/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (`admin` / `admin`)
- Tempo API: http://localhost:3200
- Tempo readiness: http://localhost:3200/ready

## 3) Generate traffic

PowerShell example:

```powershell
for ($i = 0; $i -lt 30; $i++) {
  Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing | Out-Null
}
```

## 4) Verify metrics (Prometheus)

Open Prometheus UI and try:

- `up{job="api"}`
- `sum(rate(http_server_requests_total{job="api"}[1m])) by (method, route, status_code)`
- `histogram_quantile(0.95, sum(rate(http_server_request_duration_seconds_bucket{job="api"}[5m])) by (le, route))`

Prometheus does not ship with a default app dashboard. If the expression field is empty, that is normal. Paste one of the queries above and click `Execute`.

## 5) Verify traces (Grafana + Tempo)

Open Grafana -> Dashboards -> `Observability Lab` -> `Platform DevOps Lab Overview` for ready-made metrics panels.

For traces, open Grafana -> Explore -> select `Tempo`.

- Run a trace search for service name `platform-devops-api`.
- Click a trace to inspect spans (Express + Postgres instrumentation).

Notes:

- `http://localhost:3200` returning `404 page not found` is normal. Tempo is a trace backend API, not a web UI.
- Useful Tempo endpoints are `/ready`, `/metrics`, `/api/search`, and `/api/search/tags`.

## 6) Verify logs

Container logs are structured JSON (easy to parse and ship):

```bash
docker compose -f infra/docker-compose.yml -f infra/docker-compose.observability.yml logs -f api
```

## 7) Beginner practice tasks

1. Add a new API endpoint and confirm it appears in metrics and traces.
2. Trigger a validation error and inspect status-code labels in Prometheus.
3. Raise API latency (for learning) and see p95 latency move in Prometheus.

## 8) Move this to Kubernetes (next step)

Keep app instrumentation exactly the same, then add Kubernetes collectors:

1. Prometheus Operator (or kube-prometheus-stack)
2. kube-state-metrics (pod/deployment/state telemetry)
3. node-exporter / cAdvisor (node and container telemetry)
4. OpenTelemetry Collector as a DaemonSet/Deployment
5. Grafana + Tempo/Loki in-cluster or managed

This is the key best practice: **instrument once in app code, collect everywhere through platform tooling**.
