"""
Quality-related scripts: linting and formatting.
"""

import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BLACK_CONFIG = str(BASE_DIR / "black.toml")
RUFF_CONFIG = str(BASE_DIR / "ruff.toml")
COVERAGE_CONFIG = str(BASE_DIR / ".coveragerc")


def _run(cmd: list[str]) -> int:
    """Run a subprocess command and return its return code."""
    return subprocess.run(cmd, check=False).returncode


def lint() -> None:
    """CI-style checks: Ruff lint + Black check."""
    rc = 0
    rc |= _run([sys.executable, "-m", "ruff", "check", ".", "--config", RUFF_CONFIG])
    rc |= _run([sys.executable, "-m", "black", "--check", ".", "--config", BLACK_CONFIG])
    raise SystemExit(rc)


def fmt() -> None:
    """Fix imports/lints via Ruff, then format via Black."""
    rc = 0
    rc |= _run([sys.executable, "-m", "ruff", "check", ".", "--fix", "--unsafe-fixes", "--config", RUFF_CONFIG])
    # Black: apply formatting using your config
    rc |= _run([sys.executable, "-m", "black", ".", "--config", BLACK_CONFIG])
    raise SystemExit(rc)


def coverage_report() -> None:
    """Run tests with coverage reporting."""
    rc = _run(
        [
            sys.executable,
            "-m",
            "pytest",
            "--cov=diff_fuse",
            "--cov-report=html",
            f"--cov-config={COVERAGE_CONFIG}",
        ]
    )

    if rc == 0:
        report_uri = Path("htmlcov/index.html").resolve().as_uri()
        _run([sys.executable, "-m", "webbrowser", report_uri])

    raise SystemExit(rc)
