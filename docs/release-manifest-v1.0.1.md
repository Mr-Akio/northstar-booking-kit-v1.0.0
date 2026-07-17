# Release Manifest: `v1.0.1`

This document describes the recommended commercial source package for Northstar Booking Kit.

## Release Identity

- Tag: `v1.0.1`
- Product name: `Northstar Booking Kit`
- Release posture: Commercial V1 patch release
- Intended use: sellable full-stack starter kit for time-based booking products

## Why `v1.0.1`

The original `v1.0.0` tag was created before two production fixes were completed:

- PostgreSQL booking cancellation lock fix
- Django Admin production static files fix

For buyer delivery, package and publish `v1.0.1`.

## Included Source

- `frontend/`: Next.js App Router UI, auth/session handling, resource browsing, booking flow, customer workspace, and operator surfaces
- `backend/`: Django REST API, custom user model, JWT auth, resource availability, booking engine, PostgreSQL conflict protection, Django Admin
- `docs/`: deployment, customization, commercial package, demo script, release checklist, third-party notices
- `scripts/create-release-package.ps1`: repeatable release archive generator
- `.env.example`: non-secret environment template
- Docker and CI scaffolding

## Excluded From Package

The release archive is generated with `git archive`, so ignored local artifacts are excluded:

- `.env` and `.env.*` except `.env.example`
- `frontend/node_modules/`
- `frontend/.next/`
- local SQLite databases
- media uploads
- generated release archives in `dist/`
- local test reports and caches

## Generated Artifacts

Run:

```powershell
.\scripts\create-release-package.ps1 -Version v1.0.1
```

Expected output:

- `dist/northstar-booking-kit-v1.0.1.zip`
- `dist/northstar-booking-kit-v1.0.1.sha256.txt`

## Verification Evidence

Local backend verification:

```text
python -m pytest backend
27 passed

python -m ruff check backend/common backend/config
All checks passed

python backend/manage.py check
System check identified no issues

cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
npm audit
found 0 vulnerabilities
```

Live verification:

- Render backend deploy: passed
- Django Admin CSS: passed
- Frontend smoke test: passed

## Delivery Recommendation

Use the generated zip as the source delivery package, and include a marketplace page that links to:

- live frontend demo
- Render backend health or API docs
- screenshot set in `docs/assets/screenshots/`
- demo credentials from `README.md`
- legal note that `LICENSE.md` must be reviewed before resale
