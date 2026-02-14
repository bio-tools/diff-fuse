from fastapi import APIRouter

from diff_fuse.api.routes.diff import router as diff_router

api_router = APIRouter(prefix="/api")
api_router.include_router(diff_router, prefix="/diff", tags=["diff"])
