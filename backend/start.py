from __future__ import annotations

import os

from common.runtime import run_startup


def main() -> None:
    port = os.getenv("PORT", "8000")
    run_startup(port=port, workers=3, run_migrate=True)


if __name__ == "__main__":
    main()
