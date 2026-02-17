import uvicorn

from diff_fuse.settings import get_settings


def dev() -> None:
    """Run development server with auto-reload (configurable via settings)."""
    s = get_settings()

    uvicorn.run(
        "diff_fuse.main:app",
        host=s.host,
        port=s.port,
        reload=s.reload,
        log_level=s.log_level,
    )


def serve() -> None:
    """Run production-style server (no reload by default)."""
    s = get_settings()

    uvicorn.run(
        "diff_fuse.main:app",
        host=s.host,
        port=s.port,
        reload=False,
        log_level=s.log_level,
    )
