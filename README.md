# Northstar Booking Kit

# northstar-booking-kit-v1.0.0

## 1. Project overview
A reusable full-stack booking starter kit for rooms, appointments, rentals, meeting spaces, and other time-based resources.

## 2. Feature list
- Django + DRF backend with custom user model
- JWT access tokens with refresh rotation and blacklist
- Generic resource catalog, availability rules, blackout periods, and booking flow
- Customer, staff, and admin-facing Next.js App Router frontend with a commercial-style reference UI
- UTC-first booking timestamps with frontend-side normalization from `datetime-local` inputs
- PostgreSQL-focused conflict protection with transactional booking service and PostgreSQL exclusion migration
- Production static asset pipeline for Django Admin via WhiteNoise and startup `collectstatic`
- OpenAPI schema, Docker scaffolding, CI workflow, demo seed command, backend/frontend tests, Playwright happy path, and preset-ready branding

## 3. Technology stack
- Frontend: Next.js, TypeScript, Tailwind CSS, React Hook Form, Zod, TanStack Query, Lucide, Framer Motion
- Backend: Django, DRF, PostgreSQL, Simple JWT, django-filter, drf-spectacular, Gunicorn, WhiteNoise
- Infra: Docker, Docker Compose, Nginx, GitHub Actions

## 4. Architecture overview
- `frontend/` contains the reusable UI, auth/session layer, API client, and booking-facing routes.
- `backend/` contains accounts, resources, bookings, and shared API plumbing.
- `nginx/` contains the production reverse-proxy configuration.
- `docs/` contains customization and deployment notes.

## 5. Screenshot / Demo
Use `python manage.py seed_demo` and sign in with the demo accounts below to generate a meaningful local demo.

Commercial V1 ships with preset-ready branding:
- `default` for a neutral booking product
- `clinic` for appointment and provider scheduling demos
- `meeting` for rooms, spaces, and workplace reservations
- `rental` for vehicles, equipment, and inventory reservations

Marketplace asset support:
- screenshot capture guide: `docs/screenshot-guide.md`
- buyer journey: `docs/buyer-journey.md`
- release checklist: `docs/release-checklist.md`

## 6. Requirements
- Python 3.11+
- Node 24+
- PostgreSQL 16+ for real runtime
- Docker / Docker Compose for containerized workflows

## 7. Quick start
```bash
cp .env.example .env
# the backend auto-loads the repo-root .env file
# optional: set NEXT_PUBLIC_THEME_PRESET=clinic or meeting
cd backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
cd ../frontend
npm install
npm run dev
```
In another terminal:
```bash
cd backend
python manage.py runserver
```
Open `http://localhost:3000`.

## 8. Environment variables
Use `.env.example` as the source of truth. Required runtime values include `DJANGO_SECRET_KEY`, `DATABASE_URL`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, and `NEXT_PUBLIC_API_URL`.

Hosted demo defaults:
- Vercel deploys `frontend/` only.
- Render deploys `backend/` only.
- `NEXT_PUBLIC_API_URL` must point to the Render backend base URL.
- Neon provides the `DATABASE_URL`.

## 9. Docker setup
Development:
```bash
docker compose up --build
```
Production:
```bash
docker compose -f docker-compose.prod.yml up --build
```

## 10. Local development
- Backend API docs: `http://localhost:8000/api/docs/`
- Frontend app: `http://localhost:3000`
- Django admin: `http://localhost:8000/admin/`

## 11. Database migration
```bash
cd backend
python manage.py migrate
```

## 12. Seed demo data
```bash
cd backend
python manage.py seed_demo
```

## 13. Running tests
```bash
cd backend && pytest
cd frontend && npm run test
cd frontend && npm run test:e2e
```
`npm run test:e2e` now performs a Playwright preflight check that waits for the backend to respond and verifies the seeded demo customer can sign in before the browser flow starts.

## 14. Running lint and typecheck
```bash
cd backend && ruff check .
cd frontend && npm run lint && npm run typecheck
```

## 15. API documentation
- Schema: `/api/schema/`
- Swagger UI: `/api/docs/`

## 16. Demo accounts
- Admin: `admin@northstar.local` / `DemoPass123!`
- Staff: `staff@northstar.local` / `DemoPass123!`
- Customer: `customer@northstar.local` / `DemoPass123!`

## 17. Deployment guide
See `docs/deployment.md`.

Recommended hosted demo path:
1. Create a Neon database and copy its connection string into `DATABASE_URL`.
2. Deploy the backend to Render from `backend/` or the included `render.yaml`.
3. Verify the backend health endpoint at `https://<render-domain>/api/health/` and confirm Django Admin styles load from `/static/admin/`.
4. Deploy the frontend to Vercel with `frontend/` as the root directory.
5. Set `NEXT_PUBLIC_API_URL=https://<render-domain>` in Vercel and redeploy.

## 18. Security notes
- Do not commit real secrets.
- Use HTTPS, secure cookies, and production `ALLOWED_HOSTS`/CORS/CSRF settings.
- Rotate the demo password strategy before public deployment.
- Backend stores timestamps in UTC; frontend normalizes booking inputs before sending them to the API.

## 19. Customization guide
See `docs/customization.md`.

Preset configuration:
- `NEXT_PUBLIC_THEME_PRESET=default`
- `NEXT_PUBLIC_THEME_PRESET=clinic`
- `NEXT_PUBLIC_THEME_PRESET=meeting`
- `NEXT_PUBLIC_THEME_PRESET=rental`

Commercial launch notes:
- `docs/commercial-package.md`
- `docs/sales-listing-copy.md`
- `docs/live-demo-script.md`
- `docs/final-commercial-audit-v1.0.1.md`
- `docs/release-manifest-v1.0.1.md`
- `RELEASE_NOTES.md`
- `docs/demo-presets.md`
- `docs/third-party-notices.md`
- `docs/release-checklist.md`
- `docs/clean-install-checklist.md`
- `docs/buyer-journey.md`
- `docs/screenshot-guide.md`

## 20. License explanation
See `LICENSE.md`. Review third-party licenses before commercial sale.

## 21. Known limitations
- Staff-to-resource mapping is single-owner in v1.
- The frontend currently treats availability inputs as UTC wall-clock values; projects that need per-location timezones should extend the theme/config layer.
- Docker flows were scaffolded but not executed locally because Docker is not installed in this environment.
- Hosted demo deployment still requires you to enter platform secrets in Vercel, Render, and Neon manually.

## 22. Roadmap
- Many-to-many staff assignment
- Payment integration module
- richer admin resource editing
- role-based analytics views
- email template customization and rate-limit hardening
