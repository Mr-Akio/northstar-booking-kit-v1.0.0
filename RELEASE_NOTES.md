# Release Notes

## v1.0.1 - Commercial V1 Patch

Release date: July 17, 2026

This is the recommended commercial demo and source package release. It includes the production fixes made after the initial `v1.0.0` tag.

### Fixed

- Fixed customer booking cancellation on PostgreSQL when a resource has no assigned staff member.
- Fixed Django Admin styling in production by adding WhiteNoise, hashed static storage, and startup `collectstatic`.
- Updated Render deployment behavior so paid pre-deploy commands are not required.

### Added

- Release packaging script default now targets `v1.0.1`.
- Final commercial audit, live demo script, buyer-facing sales copy, and release manifest.
- Staticfiles directory placeholder so local verification does not warn about a missing static root.

### Verification

- Backend test suite: `27 passed`
- Backend lint: `All checks passed`
- Django system check: `System check identified no issues`
- Frontend lint: passed
- Frontend typecheck: passed
- Frontend unit tests: `6 passed`, `11 passed`
- Frontend production build: passed
- Frontend dependency audit: `found 0 vulnerabilities`
- Live smoke test: passed by project owner on July 17, 2026

### Notes

- `v1.0.0` exists as an earlier tag and should not be used for the final sales package.
- Use `v1.0.1` for Gumroad, Lemon Squeezy, GitHub Releases, or direct buyer delivery.
