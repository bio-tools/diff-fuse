from fastapi import APIRouter

from diff_fuse.api.routes.diff import router as diff_router
from diff_fuse.api.routes.merge import router as merge_router
from diff_fuse.api.routes.session import router as session_router

api_router = APIRouter(prefix="/api")

api_router.include_router(diff_router, prefix="/diff", tags=["diff"])
api_router.include_router(merge_router, prefix="/merge", tags=["merge"])
api_router.include_router(session_router, prefix="/session", tags=["session"])
