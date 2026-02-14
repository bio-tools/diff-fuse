from __future__ import annotations

from fastapi import FastAPI

from diff_fuse.settings import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.environment}
