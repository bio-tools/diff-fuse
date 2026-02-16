from fastapi import APIRouter

from diff_fuse.api.routes.session import router as session_router

api_router = APIRouter(prefix="/api")

api_router.include_router(session_router, prefix="/session", tags=["session"])
