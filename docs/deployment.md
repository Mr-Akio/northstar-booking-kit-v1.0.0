# Deployment Notes

## Frontend
- Vercel: deploy `frontend/`, set `NEXT_PUBLIC_API_URL`, and point it to the backend domain.

## Backend
- Koyeb / Render / Cloud Run: deploy `backend/` with Gunicorn and set `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS`.
- Run migrations during release.
- Create the admin account with `python manage.py createsuperuser` or `seed_demo` in non-production environments only.

## Database
- Neon or Supabase PostgreSQL are suitable managed defaults.
- Ensure SSL requirements match the provider.

## Production checklist
- Use HTTPS everywhere.
- Lock down `ALLOWED_HOSTS`, CORS, and CSRF trusted origins.
- Set `REFRESH_COOKIE_SECURE=True` and disable `DJANGO_DEBUG`.
- Serve the frontend through Vercel or the production Docker stack with Nginx.
- Do not run demo seed data in production.
