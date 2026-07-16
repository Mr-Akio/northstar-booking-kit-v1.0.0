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
