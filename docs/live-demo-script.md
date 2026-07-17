# Live Demo Script

Use this script when recording a product walkthrough or presenting the kit to a buyer.

## Demo URLs

- Frontend: `https://northstar-booking-kit-v1-0-0.vercel.app/`
- Backend: `https://northstar-booking-kit-v1-0-0.onrender.com/`
- Django Admin: `https://northstar-booking-kit-v1-0-0.onrender.com/admin/`
- API docs: `https://northstar-booking-kit-v1-0-0.onrender.com/api/docs/`

## Demo Accounts

- Admin: `admin@northstar.local` / `DemoPass123!`
- Staff: `staff@northstar.local` / `DemoPass123!`
- Customer: `customer@northstar.local` / `DemoPass123!`

These are demo-only credentials. Change them before running any real production instance.

## Five-Minute Walkthrough

1. Open the frontend home page.
2. Show the neutral commercial UI and explain that the domain model is generic, not hotel-specific.
3. Log in as the customer.
4. Open Resources and select a resource.
5. Create a booking with a future date and valid guest count.
6. Open My bookings and confirm the booking appears.
7. Cancel the booking and show the status update.
8. Log out and log in as staff.
9. Open the workspace or booking management surface and show operational access.
10. Open Django Admin as admin and show users, resources, and bookings.

## Buyer Talking Points

- The kit is a working full-stack baseline, not a static UI template.
- The booking rules live in the Django service layer.
- PostgreSQL transactions and constraints are used for conflict protection.
- Resource naming is generic so buyers can adapt it to rooms, appointments, vehicles, venues, or staff calendars.
- Branding changes start in the theme configuration instead of requiring broad page rewrites.
- Payment, multi-tenancy, and advanced notifications are intentionally left as extension points.

## Before Recording

- Confirm Render is awake by opening `/api/health/`.
- Confirm Django Admin CSS loads normally.
- Confirm the frontend is using the correct `NEXT_PUBLIC_API_URL`.
- Create or seed enough demo data so the catalog is not empty.
- Use a clean browser profile or log out before starting the recording.

