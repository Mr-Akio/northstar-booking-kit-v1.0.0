# Final Commercial Audit: `v1.0.1`

Date: July 17, 2026

## Status

Northstar Booking Kit is ready to package and present as a Commercial V1 starter kit.

This means it is suitable for:

- live demo walkthroughs
- marketplace listing drafts
- paid source-code delivery
- client discovery calls
- continued productization

It should still be presented honestly as a starter kit, not as a finished multi-tenant SaaS.

## Passed

- Frontend deploy is live on Vercel.
- Backend deploy is live on Render.
- PostgreSQL database is live on Neon.
- Login and logout flow passed live smoke testing.
- Resource browsing passed live smoke testing.
- Booking creation passed live smoke testing.
- Booking cancellation passed live smoke testing.
- Django Admin loads with production CSS.
- Demo accounts are documented.
- Backend tests pass locally.
- Backend lint passes locally.
- Django system check passes locally.
- Frontend lint, typecheck, unit tests, and production build pass locally.
- Frontend dependency audit reports zero known vulnerabilities.
- Packaging script exists and generates a source zip from a git tag.

## Important Release Decision

Use `v1.0.1` for buyer delivery.

The existing `v1.0.0` tag points to an older commit before the final production fixes. Keeping that tag avoids rewriting history. The commercial package should be created from `v1.0.1`.

## Known Limitations To Disclose

- Payment gateway is not included.
- Multi-tenancy is not included.
- Email delivery is structured but not configured for a production email provider.
- Staff assignment is single-owner in V1.
- The included license file is a placeholder and must be reviewed.
- Demo accounts use demo passwords only.
- Render free tier may sleep when inactive.

## Recommended Buyer Delivery

- `dist/northstar-booking-kit-v1.0.1.zip`
- `dist/northstar-booking-kit-v1.0.1.sha256.txt`
- link to live demo
- link to API docs
- screenshot gallery from `docs/assets/screenshots/`
- clear note that buyers must configure their own secrets and license

## Next Product Work

- Add payment integration module.
- Add many-to-many staff assignments.
- Improve staff/admin frontend CRUD depth.
- Add email template customization.
- Add buyer onboarding video or guided install page.
