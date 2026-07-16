# Customization Guide

- Branding: update `frontend/src/config/theme.ts` for brand name, logo text, support label, footer statement, accent colors, currency, and terminology.
- Theme presets: start by duplicating one of the built-in presets in `frontend/src/config/theme.ts` and point `NEXT_PUBLIC_THEME_PRESET` at the new key instead of editing page components one by one.
- Logo: replace the header mark in `frontend/src/components/app-shell.tsx` or wire it to a brand asset.
- Accent color: change `accentColor` and `accentSoftColor` in `frontend/src/config/theme.ts`. The app shell now pushes those values into CSS variables globally.
- Surface styling: adjust shared neutrals, borders, shadows, and background treatment in `frontend/src/app/globals.css`.
- Shared UI primitives: update `frontend/src/components/ui.tsx` to alter badges, metric cards, cards, section spacing, and button-link behavior in one place.
- Currency: update `BOOKING_DEFAULT_CURRENCY` in `.env` and the frontend theme config.
- Date format: centralize any formatting changes in `frontend/src/lib/utils.ts`.
- Booking terminology: change the `terminology` map in `theme.ts` and any label text in page components.
- Resource fields: extend `backend/resources/models.py`, serializer definitions, and the matching frontend types.
- User roles: adjust `accounts.models.UserRole`, permission classes, and frontend gating.
- Booking statuses: update `BookingStatus`, service transitions, and any status badges/views.
- Pricing logic: extend `backend/bookings/services.py`.
- Email templates: replace the direct email body generation in `backend/accounts/views.py`.
- Cancellation policy: change transition checks in `backend/bookings/services.py` and surface the policy in the checkout/booking detail UI.
