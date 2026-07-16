# Deployment Notes

## Recommended hosted demo stack

- `frontend/` on Vercel
- `backend/` on Render
- PostgreSQL on Neon

This is the canonical hosted-demo path for Northstar Booking Kit v1.0.0.

## 1. Create the Neon database

Create a Neon project and copy the production branch connection string.

Use that value as:

```env
DATABASE_URL=postgresql://...neon.tech/...?...sslmode=require
DATABASE_SSL_REQUIRED=True
```

## 2. Deploy the backend on Render

### Preferred path

Import the repository with the root `render.yaml` blueprint. The blueprint is configured for:

- `rootDir: backend`
- Docker runtime
- `Dockerfile` resolved from `backend/Dockerfile`
- health check path `/api/schema/`

### Manual path

If you configure the service manually in the Render dashboard:

- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`
- Docker Build Context Directory: `.`
- Health Check Path: `/api/schema/`

The backend container now runs migrations on startup and binds Gunicorn to Render's runtime `PORT`, so you do not need a paid pre-deploy command.

### Required backend env vars

```env
DJANGO_SECRET_KEY=<random-long-secret>
DJANGO_DEBUG=False
DATABASE_URL=<your-neon-connection-string>
DATABASE_SSL_REQUIRED=True
DJANGO_ALLOWED_HOSTS=<your-render-service>.onrender.com
CORS_ALLOWED_ORIGINS=https://<your-vercel-project>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-vercel-project>.vercel.app
FRONTEND_URL=https://<your-vercel-project>.vercel.app
REFRESH_COOKIE_SECURE=True
REFRESH_COOKIE_SAMESITE=None
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
BOOKING_DEFAULT_CURRENCY=USD
JWT_ACCESS_TOKEN_MINUTES=15
JWT_REFRESH_TOKEN_DAYS=7
```

### Backend verification

After the service finishes deploying, open:

```text
https://<your-render-service>.onrender.com/api/schema/
```

If that endpoint responds, the backend health check path is working.

## 3. Deploy the frontend on Vercel

Vercel should deploy `frontend/` only. Do not import the Django backend as a Vercel service.

### Vercel project settings

- Framework: `Next.js`
- Root Directory: `frontend`

### Required frontend env vars

```env
NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com
NEXT_PUBLIC_THEME_PRESET=default
```

After saving the env vars, deploy or redeploy the Vercel project.

## 4. Seed data and admin setup

- For demo environments, you can run `python manage.py seed_demo`
- For non-demo production environments, create your admin account with `python manage.py createsuperuser`
- Do not seed demo data into a public production tenant

## 5. HTTPS, CORS, and CSRF

- Use HTTPS on both Vercel and Render
- Lock `DJANGO_ALLOWED_HOSTS` to the exact Render domain or custom backend domain
- Lock `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to the exact Vercel frontend domain or custom frontend domain
- Keep `REFRESH_COOKIE_SECURE=True` for hosted environments
- Keep `REFRESH_COOKIE_SAMESITE=None` when frontend and backend live on different domains

## 6. When to use Docker Compose instead

Use the local Docker setup when you want:

- full local verification
- local PostgreSQL
- local frontend + backend integration

Use the Vercel + Render + Neon path when you want:

- a hosted demo
- a buyer-facing preview
- a simple commercial showcase deployment
