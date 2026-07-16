# Screenshot Guide

Northstar Booking Kit now supports a repeatable screenshot flow for marketplace assets.

## Recommended screenshot set

- Home page
- Resource catalog
- Resource detail
- Login
- Customer workspace
- Bookings list
- Admin dashboard

## Capture command

```bash
cd frontend
npm run capture:screenshots
```

This command writes PNG files into `docs/assets/screenshots/`.

## Notes

- Run the backend and frontend locally before capturing screenshots.
- Seed demo data first.
- Capture the `default` preset for generic marketplace use.
- Re-run with a different `NEXT_PUBLIC_THEME_PRESET` if you want industry-specific marketing images.
