"""
Application server entrypoints.

This module provides convenience wrappers for launching the FastAPI
application under Uvicorn in different modes.

Two modes are exposed:
- :func:`dev`   — development server with optional auto-reload
- :func:`serve` — production-style server without reload

Notes
-----
These functions are wired into ``pyproject.toml`` scripts.
In containerized or orchestrated deployments, you may instead invoke
Uvicorn directly.
"""

import uvicorn

from diff_fuse.settings import get_settings


def dev() -> None:
    """
    Run the development server.

    This mode respects the ``reload`` flag from settings and is intended
    for local development.

    Behavior
    --------
    - Enables auto-reload when configured.
    - Uses configured host/port/log level.
    - Not recommended for production.

    Notes
    -----
    Auto-reload can spawn multiple worker processes and should be avoided
    in containerized or production environments.
    """
    s = get_settings()

    uvicorn.run(
        "diff_fuse.main:app",
        host=s.host,
        port=s.port,
        reload=s.reload,
        log_level=s.log_level,
    )


def serve() -> None:
    """
    Run the production-style server.

    This mode always disables auto-reload regardless of settings and is
    intended for production or container environments.

    Behavior
    --------
    - Forces ``reload=False``.
    - Uses configured host/port/log level.
    - Suitable for Docker/Kubernetes deployments.

    Notes
    -----
    For high-throughput production workloads, consider running Uvicorn
    with multiple workers via a process manager (e.g., gunicorn or
    uvicorn workers) rather than relying on a single-process launch.
    """
    s = get_settings()

    uvicorn.run(
        "diff_fuse.main:app",
        host=s.host,
        port=s.port,
        reload=False,
        log_level=s.log_level,
    )
