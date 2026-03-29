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
    - Number of workers is forced to 1 when reload is enabled.
    - Uses configured host/port/log level.
    - Not recommended for production.
    """
    s = get_settings()

    # Uvicorn reload mode does not support multiple workers in a useful/consistent way.
    workers = 1 if s.reload else max(1, s.uvicorn_workers)

    uvicorn.run(
        "diff_fuse.main:app",
        host=s.host,
        port=s.port,
        reload=s.reload,
        log_level=s.log_level,
        workers=workers,
    )


def serve() -> None:
    """
    Run the production-style server.

    This mode always disables auto-reload regardless of settings and is
    intended for production or container environments.

    Behavior
    --------
    - Forces ``reload=False``.
    - Uses configured number of workers (default 1).
    - Uses configured host/port/log level.
    - Suitable for Docker/Kubernetes deployments.
    """
    s = get_settings()

    uvicorn.run(
        "diff_fuse.main:app",
        host=s.host,
        port=s.port,
        reload=False,
        log_level=s.log_level,
        workers=max(1, s.uvicorn_workers),
    )
