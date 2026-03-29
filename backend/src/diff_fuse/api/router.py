"""
Top-level API router composition for diff-fuse.

This module assembles the public FastAPI router by composing the
feature-specific sub-routers. It acts as the single aggregation point
for all HTTP endpoints exposed by the backend.
"""

from fastapi import APIRouter

from .routes.array_keys import router as arrays_router
from .routes.diff import router as diff_router
from .routes.export import router as export_router
from .routes.merge import router as merge_router
from .routes.session import router as base_router

router = APIRouter()

router.include_router(base_router)
router.include_router(diff_router)
router.include_router(merge_router)
router.include_router(arrays_router)
router.include_router(export_router)
