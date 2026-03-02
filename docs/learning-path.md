# Learning Path (Beginner to Platform Basics)

Use this order. Do not skip steps.

1. App fundamentals (Week 1)

- Run Team Task Hub with Docker Compose.
- Trace request flow: browser -> API routes -> service -> repository -> Postgres.
- Add one feature (for example, task comments or tags).

2. Source control and CI (Week 1)

- Create a GitHub repo and push this project.
- Open a PR and inspect CI checks from `.github/workflows/ci.yml`.
- Break the build intentionally, then fix it.

3. Container skills (Week 2)

- Read both Dockerfiles.
- Rebuild images and inspect size/layers.
- Add healthchecks and resource limits.

4. Kubernetes basics (Week 2)

- Create local cluster: `kind create cluster --name platform-lab`.
- Apply manifests from `infra/k8s/` (namespace first):
  - `kubectl apply -f infra/k8s/namespace.yaml`
  - `kubectl apply -f infra/k8s/postgres.yaml`
  - `kubectl apply -f infra/k8s/api.yaml`
  - `kubectl apply -f infra/k8s/frontend.yaml`
- Port-forward services and verify UI/API traffic.

5. Observability intro (Week 3)

- Run the full local observability lab:
  - `make obs-bg`
  - Follow [docs/observability-lab.md](./observability-lab.md)
- Generate API traffic and inspect:
  - metrics in Prometheus
  - traces in Grafana (Tempo datasource)
  - structured logs from API container

6. Delivery workflow (Week 3)

- Build and push images to GHCR from GitHub Actions.
- Deploy to local cluster automatically from CI on `main`.

7. Infrastructure as code (Week 4)

- Add Terraform for one provider (Cloudflare, Render, or AWS free tier eligible resources).
- Keep all infra changes through PRs.

By the end, you will understand: app runtime, containerization, CI/CD, environment promotion, and basic platform operations.
