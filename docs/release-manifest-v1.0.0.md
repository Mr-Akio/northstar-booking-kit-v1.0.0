# Release Manifest: `v1.0.0`

This document describes the first commercial-ready release checkpoint prepared from this repository on July 16, 2026.

## Intended release identity

- Tag: `v1.0.0`
- Product name: `Northstar Booking Kit`
- Positioning: reusable full-stack booking starter for appointments, rooms, rentals, and reservable resources

## Source state included

- Frontend commercial UI pass
- Booking flow, customer workspace, operator surfaces, and admin pages
- Branding presets: `default`, `clinic`, `meeting`, `rental`
- Release tooling and sales docs
- Marketplace screenshots in `docs/assets/screenshots/`

## Distribution artifacts

The release packaging script writes:

- `dist/northstar-booking-kit-v1.0.0.zip`
- `dist/northstar-booking-kit-v1.0.0.sha256.txt`

## Build and verification commands used for this release

Backend:

```bash
cd backend
python -m pytest
python -m ruff check .
python manage.py check
python manage.py spectacular --validate --file schema-check.yml
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run capture:screenshots
```

## Notes

- The `.env` file is intentionally excluded from the release package.
- `dist/` is ignored in git so generated archives and checksums stay out of source control.
- This manifest documents technical readiness, not legal sign-off.
