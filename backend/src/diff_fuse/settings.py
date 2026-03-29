"""
Application configuration via environment variables.

This module defines the strongly-typed settings model used across the
diff-fuse backend. Configuration is loaded from environment variables
(using the ``DIFF_FUSE_`` prefix) and optionally from a local ``.env`` file.

Design goals
------------
- Centralized configuration.
- Strong typing and validation.
- Easy override via environment variables.
- Safe defaults for local development.

Usage
-----
Always access settings via :func:`get_settings` to ensure a single
shared instance across the application.
"""

from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application runtime configuration.

    Values are populated from environment variables using the prefix
    ``DIFF_FUSE_`` (see ``model_config``).

    Sections
    --------
    App
        Basic service identity and environment flags.
    Server
        Uvicorn runtime configuration.
    CORS
        Browser access configuration.
    Sessions
        Session storage backend and limits.
    Safety limits
        Defensive guards against pathological inputs.

    Notes
    -----
    - All limits are **defensive**, not guarantees.
    - Environment variables always override defaults.
    """

    # ------------------------------------------------------------------
    # App
    # ------------------------------------------------------------------

    app_name: str = "diff-fuse"
    """Human-readable application name."""

    environment: Literal["dev", "test", "prod"] = "dev"
    """
    Deployment environment identifier.
    """

    # ------------------------------------------------------------------
    # Server (uvicorn)
    # ------------------------------------------------------------------

    host: str = "127.0.0.1"
    """Bind host for the ASGI server."""

    port: int = 8000
    """Bind port for the ASGI server."""

    log_level: str = "info"
    """Uvicorn log level."""

    reload: bool = True
    """
    Whether to enable auto-reload (development only).

    WARNING: Must be disabled in production.
    """

    uvicorn_workers: int = 1
    """
    Number of worker processes to run.

    Notes
    -----
    - For development (reload=True), workers should remain 1.
    - For production, workers > 1 requires a shared session backend (e.g., Redis).
    """

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------

    cors_allow_origins: list[str] = ["http://localhost:5173"]
    """
    Allowed CORS origins for browser clients.

    In production this should be explicitly restricted.
    """

    # ------------------------------------------------------------------
    # Session backend
    # ------------------------------------------------------------------

    session_backend: Literal["memory", "redis"] = "memory"
    """
    Session storage backend.
    """

    session_ttl_seconds: int = 3600
    """Session time-to-live in seconds."""

    redis_url: str = "redis://localhost:6379/0"
    """Redis connection URL (used when ``session_backend='redis'``)."""

    redis_key_prefix: str = "diff-fuse:session:"
    """Prefix for Redis session keys."""

    # ------------------------------------------------------------------
    # Defensive limits
    # ------------------------------------------------------------------

    max_documents_per_session: int = 10
    """Maximum number of documents allowed in one session."""

    max_document_chars: int = 1_000_000
    """Maximum raw input size per document (characters)."""

    max_total_chars_per_session: int = 3_000_000
    """Maximum combined size of all documents in a session."""

    max_json_depth: int = 60
    """
    Maximum allowed JSON nesting depth.
    Prevents stack explosions during normalization/diff.
    """

    max_diff_nodes: int = 200_000
    """
    Maximum number of diff tree nodes.
    Protects against extremely large structural diffs.
    """

    # ------------------------------------------------------------------
    # Pydantic settings config
    # ------------------------------------------------------------------

    model_config = SettingsConfigDict(
        env_prefix="DIFF_FUSE_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


_settings: Settings | None = None


def get_settings() -> Settings:
    """
    Return the singleton settings instance.

    Returns
    -------
    Settings
        Cached application settings.

    Notes
    -----
    This avoids repeatedly parsing environment variables and ensures
    consistent configuration across the application.
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
