# Clean Install Checklist

This checklist mirrors the experience a buyer should have after downloading or cloning the repository.

## Expected workflow

1. Copy `.env.example` to `.env`.
2. Install backend dependencies.
3. Run backend migrations.
4. Seed demo data.
5. Install frontend dependencies.
6. Start backend on `http://localhost:8000`.
7. Start frontend on `http://localhost:3000`.
8. Log in with the demo customer.
9. Browse a resource.
10. Create and cancel a booking.
11. Log in as staff or admin and verify access boundaries.

## Manual sign-off prompts

- Did the backend start without missing environment variable errors?
- Did the frontend load without console errors?
- Did the demo customer sign in successfully?
- Did the booking confirmation screen appear after checkout?
- Did the booking appear in the customer workspace?
- Did cancellation work and update the booking status?
- Did the admin pages load correctly after admin sign-in?

## If something fails

- Fix the issue in code or docs before release.
- Update [README.md](D:/booking-starter-kit/README.md) if the buyer-facing setup changed.
- Re-run the full command set from [release-checklist.md](D:/booking-starter-kit/docs/release-checklist.md).
