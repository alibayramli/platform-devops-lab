# Free Setup Recommendation (Verified on March 2, 2026)

This is the best zero-cost setup for this demo because it teaches real DevOps workflows without requiring paid infrastructure.

## Best free stack for this project

- Local lab: Docker Desktop + Docker Compose + kind (all free, local-only cost is your machine resources)
- Git + CI: GitHub Free + GitHub Actions
- Registry: GitHub Container Registry (GHCR)
- Public demo hosting:
  - Frontend: Cloudflare Pages Free
  - API: Cloudflare Workers Free
  - Database: Cloudflare D1 Free

## Why this setup is strong for learning

- You learn environment parity: local containers, then cloud deploy.
- You learn CI/CD with the same git platform you already use.
- You avoid idle-cost risk from always-on VMs or managed clusters.
- You still get a public URL for portfolio/demo sharing.

## Free-tier limits to watch

- GitHub Actions (Free plan): includes monthly free minutes/storage for private repos; minutes usage is unlimited for public repositories.
- GHCR: public container images are free; private package storage/transfer may incur charges.
- Cloudflare Pages Free: 500 builds per month and platform limits for files/asset size.
- Cloudflare Workers Free: 100,000 requests per day and CPU-time/request limits.
- Cloudflare D1 Free: 1 GB storage, 5 million rows read/day, 100,000 rows written/day.

## Cost-control rules

- Keep your repo public while learning to maximize free CI usage.
- Build local-first (`docker compose`, `kind`) and deploy cloud only for demo milestones.
- Delete unused Workers/DBs and stale preview environments monthly.
- Configure billing alerts if you enable any paid plan later.

## Official references

- GitHub Actions billing: https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions
- GitHub Packages (GHCR) billing: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-packages/about-billing-for-github-packages#container-registry
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/
