from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "diff-fuse"
    environment: str = "dev"  # dev|test|prod

    # Server (uvicorn)
    host: str = "127.0.0.1"
    port: int = 8000
    log_level: str = "info"
    reload: bool = True

    # CORS (useful once frontend talks to backend)
    cors_allow_origins: list[str] = ["http://localhost:5173"]

    session_backend: Literal["memory", "redis"] = "memory"
    session_ttl_seconds: int = 3600  # 60 min
    redis_url: str = "redis://localhost:6379/0"
    redis_key_prefix: str = "diff-fuse:session:"

    model_config = SettingsConfigDict(
        env_prefix="DIFF_FUSE_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


_settings: Settings | None = None


def get_settings() -> Settings:
    """Singleton-ish settings accessor."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
