# Deploy-Ready Render + Vercel + Neon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hosted demo path deploy-ready for Render + Vercel + Neon without brittle dashboard-only workarounds.

**Architecture:** Move backend startup into a small Python entrypoint that can run migrations and bind Gunicorn to the platform-provided port, then point Docker and Render at that entrypoint. Keep Vercel limited to `frontend/` by documentation, and tighten root-level deployment docs/env examples so the hosted flow is copy-follow.

**Tech Stack:** Django, Gunicorn, Docker, Render Blueprint, Next.js, Vercel, Neon, pytest

## Global Constraints

- Keep the domain generic; do not reintroduce travel-specific naming.
- Preserve the split between `frontend/` and `backend/`.
- Keep business rules in backend services, not in React components.
- Do not commit real secrets, media uploads, local DB files, or demo credentials beyond the documented demo accounts.
- Update docs when changing auth, booking rules, pricing, or deployment behavior.
- Keep Docker as the backend deployment method so the production story stays consistent.
- Vercel deploys `frontend/` only; Render deploys `backend/` only.

---

### Task 1: Backend startup entrypoint and tests

**Files:**
- Create: `backend/common/runtime.py`
- Create: `backend/tests/test_runtime.py`

**Interfaces:**
- Produces: `build_gunicorn_command(port: str, workers: int = 3) -> list[str]`
- Produces: `run_startup(port: str, workers: int = 3, run_migrate: bool = True) -> None`

- [ ] **Step 1: Write the failing test**

```python
from unittest.mock import call, patch

from common.runtime import build_gunicorn_command, run_startup


def test_build_gunicorn_command_uses_runtime_port():
    assert build_gunicorn_command("10000") == [
        "gunicorn",
        "config.wsgi:application",
        "--bind",
        "0.0.0.0:10000",
        "--workers",
        "3",
    ]


def test_run_startup_runs_migrate_before_gunicorn():
    with patch("common.runtime.subprocess.run") as run, patch("common.runtime.subprocess.Popen") as popen:
        process = popen.return_value
        process.wait.return_value = 0
        run_startup("10000")

    run.assert_called_once_with(["python", "manage.py", "migrate"], check=True)
    popen.assert_called_once_with(build_gunicorn_command("10000"))
    process.wait.assert_called_once_with()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend; python -m pytest tests/test_runtime.py -q`
Expected: FAIL with `ModuleNotFoundError` for `common.runtime`

- [ ] **Step 3: Write minimal implementation**

```python
from __future__ import annotations

import subprocess


def build_gunicorn_command(port: str, workers: int = 3) -> list[str]:
    return [
        "gunicorn",
        "config.wsgi:application",
        "--bind",
        f"0.0.0.0:{port}",
        "--workers",
        str(workers),
    ]


def run_startup(port: str, workers: int = 3, run_migrate: bool = True) -> None:
    if run_migrate:
        subprocess.run(["python", "manage.py", "migrate"], check=True)

    process = subprocess.Popen(build_gunicorn_command(port, workers))
    raise SystemExit(process.wait())
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend; python -m pytest tests/test_runtime.py -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/common/runtime.py backend/tests/test_runtime.py
git commit -m "Add backend runtime startup helpers"
```

### Task 2: Wire Docker and Render to the startup flow

**Files:**
- Create: `backend/start.py`
- Modify: `backend/Dockerfile`
- Create: `render.yaml`

**Interfaces:**
- Consumes: `run_startup(port: str, workers: int = 3, run_migrate: bool = True) -> None`
- Produces: Docker container starts with `python start.py`
- Produces: Render blueprint rooted at `backend/`

- [ ] **Step 1: Write the failing test**

```python
from unittest.mock import patch

from start import main


def test_start_main_uses_port_environment_variable(monkeypatch):
    monkeypatch.setenv("PORT", "10000")

    with patch("start.run_startup") as run_startup:
        main()

    run_startup.assert_called_once_with(port="10000", workers=3, run_migrate=True)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend; python -m pytest tests/test_runtime.py -q`
Expected: FAIL because `start.py` does not exist yet

- [ ] **Step 3: Write minimal implementation**

```python
from __future__ import annotations

import os

from common.runtime import run_startup


def main() -> None:
    port = os.getenv("PORT", "8000")
    run_startup(port=port, workers=3, run_migrate=True)


if __name__ == "__main__":
    main()
```

Update `backend/Dockerfile` command to:

```dockerfile
CMD ["python", "start.py"]
```

Add `render.yaml`:

```yaml
services:
  - type: web
    name: northstar-booking-kit-api
    runtime: docker
    rootDir: backend
    dockerfilePath: ./Dockerfile
    healthCheckPath: /api/schema/
    envVars:
      - key: DJANGO_SECRET_KEY
        sync: false
      - key: DATABASE_URL
        sync: false
      - key: DATABASE_SSL_REQUIRED
        value: "True"
      - key: DJANGO_DEBUG
        value: "False"
      - key: DJANGO_ALLOWED_HOSTS
        sync: false
      - key: CORS_ALLOWED_ORIGINS
        sync: false
      - key: CSRF_TRUSTED_ORIGINS
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: REFRESH_COOKIE_SECURE
        value: "True"
      - key: REFRESH_COOKIE_SAMESITE
        value: "None"
      - key: SESSION_COOKIE_SECURE
        value: "True"
      - key: CSRF_COOKIE_SECURE
        value: "True"
      - key: BOOKING_DEFAULT_CURRENCY
        value: "USD"
      - key: JWT_ACCESS_TOKEN_MINUTES
        value: "15"
      - key: JWT_REFRESH_TOKEN_DAYS
        value: "7"
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend; python -m pytest tests/test_runtime.py -q`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/start.py backend/Dockerfile render.yaml
git commit -m "Wire Render startup through Python entrypoint"
```

### Task 3: Hosted env contract and deployment docs

**Files:**
- Modify: `.env.example`
- Modify: `docs/deployment.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: backend startup contract and Render blueprint values
- Produces: hosted-demo instructions for Neon, Render, and Vercel

- [ ] **Step 1: Write the failing documentation assertions**

```text
README must state:
- Vercel deploys frontend only
- Render deploys backend only
- NEXT_PUBLIC_API_URL points to Render

docs/deployment.md must state:
- Neon provides DATABASE_URL
- Render root directory is backend
- Render uses Dockerfile at backend/Dockerfile via blueprint or rootDir backend
- Health check path is /api/schema/
```

- [ ] **Step 2: Verify the current docs do not meet the assertions**

Run:

```bash
rg "Vercel deploys frontend only|Render deploys backend only|NEXT_PUBLIC_API_URL points to Render|root directory is backend|/api/schema/" README.md docs/deployment.md .env.example
```

Expected: missing or incomplete matches

- [ ] **Step 3: Write minimal documentation updates**

Add hosted-demo examples to `.env.example` and rewrite deployment docs/README sections so the buyer can:

1. create Neon
2. create Render from `render.yaml` or manual backend root
3. verify `https://<render-domain>/api/schema/`
4. create Vercel project rooted at `frontend/`
5. set `NEXT_PUBLIC_API_URL=https://<render-domain>`

- [ ] **Step 4: Run verification**

Run:

```bash
rg "frontend only|backend only|NEXT_PUBLIC_API_URL|/api/schema/|render.yaml|Neon" README.md docs/deployment.md .env.example
```

Expected: all required phrases present in the updated docs

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md docs/deployment.md
git commit -m "Document deploy-ready hosted demo flow"
```

### Task 4: Final verification

**Files:**
- Verify: `backend/common/runtime.py`
- Verify: `backend/start.py`
- Verify: `backend/tests/test_runtime.py`
- Verify: `backend/Dockerfile`
- Verify: `render.yaml`
- Verify: `.env.example`
- Verify: `README.md`
- Verify: `docs/deployment.md`

**Interfaces:**
- Consumes: all previous tasks
- Produces: verified deploy-ready backend and docs

- [ ] **Step 1: Run backend tests**

Run: `cd backend; python -m pytest tests/test_runtime.py -q`
Expected: PASS

- [ ] **Step 2: Run backend project checks**

Run: `cd backend; python manage.py check`
Expected: `System check identified no issues`

- [ ] **Step 3: Run frontend build**

Run: `cd frontend; cmd /c npm run build`
Expected: successful production build

- [ ] **Step 4: Review git diff**

Run: `git diff --stat`
Expected: only startup, Render config, and docs/env files changed

- [ ] **Step 5: Commit**

```bash
git add backend/common/runtime.py backend/start.py backend/tests/test_runtime.py backend/Dockerfile render.yaml .env.example README.md docs/deployment.md
git commit -m "Make Render and Vercel demo deployment easier"
```
