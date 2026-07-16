from __future__ import annotations

from pathlib import Path
from typing import MutableMapping


def load_dotenv_file(dotenv_path: Path, environ: MutableMapping[str, str]) -> None:
    if not dotenv_path.exists():
        return

    for raw_line in dotenv_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        environ.setdefault(key.strip(), value.strip())
