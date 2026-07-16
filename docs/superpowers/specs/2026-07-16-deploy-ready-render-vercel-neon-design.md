# Deploy-Ready Render + Vercel + Neon Design

## Summary

This design defines a deploy-ready hosting path for Northstar Booking Kit using:

- Vercel for the `frontend/` Next.js application
- Render for the `backend/` Django application
- Neon for the managed PostgreSQL database

The goal is to make the hosted demo path simple enough for buyers to follow from a clean clone without trial-and-error in the hosting dashboards.

## Problem Statement

The current repository can run locally and in Docker, but the hosted-demo flow is still too manual and fragile:

- Render deployment depends on several dashboard-only path settings.
- The backend container binds to a fixed port instead of the hosting platform port.
- Database migrations require extra manual handling on free-tier hosting.
- Documentation does not yet provide a short, copy-follow deployment path for the chosen platform trio.
- Vercel can mis-detect the monorepo as a multi-service import unless the deployment story is explicit.

These issues create friction for demo deployment and reduce commercial readiness.

## Goals

- Make Render deployment work with minimal dashboard configuration.
- Make the backend startup compatible with Render-assigned ports.
- Keep Docker as the backend deployment method so the production story stays consistent.
- Document a single recommended hosted-demo path using Vercel + Render + Neon.
- Reduce buyer-facing setup ambiguity around env vars, CORS, CSRF, and hosted URLs.

## Non-Goals

- No live deployment from this task.
- No new infrastructure components such as Redis, Celery, or WebSockets.
- No backend domain-logic changes unrelated to hosting.
- No switch from Docker-based backend deployment to Render native Python runtime.

## Recommended Approach

### 1. Make backend startup platform-aware

Update the backend container startup so Gunicorn binds to the platform-provided `PORT` instead of hardcoding `8000`.

This removes the current Render health-check loop caused by the service listening on a fixed port.

### 2. Move startup behavior into a reusable entrypoint

Add a backend startup script that:

1. Applies migrations with `python manage.py migrate`
2. Starts Gunicorn bound to `0.0.0.0:${PORT}`

This keeps Render free-tier setup simple because it avoids relying on the paid-only pre-deploy command field.

### 3. Add a Render blueprint file

Add a root `render.yaml` describing the backend web service:

- root directory
- dockerfile path
- health check path
- required environment variable names

This gives buyers a canonical Render configuration and reduces dashboard path mistakes.

### 4. Clarify the Vercel monorepo path

Add a root `vercel.json` only if it helps avoid service confusion without overcomplicating the repo. If Vercel configuration is clearer through documentation alone, prefer documentation and keep the Vercel project rooted at `frontend/`.

The repository should explicitly document that Vercel deploys only `frontend/`, not the backend.

### 5. Tighten deployment documentation

Update deployment docs and README so the flow is short and deterministic:

1. Create Neon database
2. Create Render backend service
3. Add backend env vars
4. Verify `/api/schema/`
5. Create Vercel frontend project rooted at `frontend/`
6. Add `NEXT_PUBLIC_API_URL`
7. Redeploy frontend

## Files To Change

- Modify: `backend/Dockerfile`
- Add: `backend/start.sh`
- Add: `render.yaml`
- Optionally add: `vercel.json`
- Modify: `README.md`
- Modify: `docs/deployment.md`
- Modify: `.env.example`

## Configuration Rules

### Backend hosting

- Render service uses the `backend/` folder only.
- Backend startup must respect `PORT`.
- Health check path remains `/api/schema/`.
- Refresh cookies must support cross-site requests between Vercel and Render:
  - `REFRESH_COOKIE_SECURE=True`
  - `REFRESH_COOKIE_SAMESITE=None`

### Frontend hosting

- Vercel project root is `frontend/`.
- Frontend requires `NEXT_PUBLIC_API_URL` pointed at the Render backend base URL.
- Vercel should not deploy or infer the Django backend as a service.

### Database hosting

- Neon provides `DATABASE_URL`.
- `DATABASE_SSL_REQUIRED=True` remains the recommended hosted setting.

## Error Handling And Verification

The deploy-ready path is considered successful when:

- Render no longer loops on port detection.
- Backend health check returns success on `/api/schema/`.
- Frontend build remains successful with hosted env configuration.
- Documentation tells the user exactly where each env var belongs.

## Testing Strategy

Run lightweight verification after the code changes:

- Backend: `python manage.py check`
- Frontend: `cmd /c npm run build`

If local verification surfaces a regression, fix that before considering the deployment path complete.

## Tradeoffs

### Why keep Docker on Render

- It preserves the backend deployment story already present in the repository.
- It keeps hosted demo setup aligned with the production container path.
- It avoids having separate operational behavior between local Docker and hosted backend runtime.

### Why run migrations at container start

- It is the simplest free-tier-compatible flow.
- `migrate` is safe to run repeatedly.
- It is acceptable for a demo-oriented starter kit, even though larger systems may prefer release-phase jobs.

## Acceptance Criteria

- Backend no longer hardcodes port `8000`.
- Render deployment can be configured without path duplication errors.
- Free-tier Render setup no longer depends on pre-deploy command support.
- README and deployment docs clearly separate:
  - Neon database setup
  - Render backend setup
  - Vercel frontend setup
- The repo is easier to deploy as a hosted demo without guessing.
