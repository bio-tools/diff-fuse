from fastapi import APIRouter

from .arrays import router as arrays_router
from .base import router as base_router
from .diff import router as diff_router
from .export import router as export_router
from .merge import router as merge_router

router = APIRouter()
router.include_router(base_router)
router.include_router(diff_router)
router.include_router(merge_router)
router.include_router(arrays_router)
router.include_router(export_router)
