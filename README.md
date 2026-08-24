# Kanban dashboard

## Status

- **Stage:** production ready
- **Audited:** 2026-08-23

Personal three-column board. Calm desk: index cards on warm paper.

## Setup

Copy `.env.example` to `.env`. `VITE_API_BASE_URL` is the API **origin only** (`http://localhost:3000`), not `/api/v1`.

Vite prints the SPA origin (usually `http://localhost:5173`). That origin must be in `personal-api` `CORS_ORIGINS`.

Refresh token lives in `localStorage` under `kanban:refresh:v1`. Access token stays in memory.

```bash
npm install
npm run dev
```

Accounts are provisioned; there is no public signup.

## Deployment (GitHub Pages)

A push to `main` runs `.github/workflows/deploy.yml` (lint, typecheck, test,
build) and deploys `dist/` to Pages at
`https://franciscoveloz1.github.io/kanban-dashboard/`.

Local `npm run dev` stays at `/`. The Pages `base` (`/kanban-dashboard/`) is set
only in CI via `VITE_BASE_PATH`. Production API origin is the
`VITE_API_BASE_URL` repository secret (no trailing slash).

```bash
gh secret set VITE_API_BASE_URL --body "https://YOUR-API.up.railway.app"
```

On `personal-api`, include `https://franciscoveloz1.github.io` in `CORS_ORIGINS`.
