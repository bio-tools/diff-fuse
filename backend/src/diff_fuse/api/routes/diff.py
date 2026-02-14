from __future__ import annotations

from fastapi import APIRouter

from diff_fuse.api.schemas.diff import DiffRequest, DiffResponse
from diff_fuse.services.diff_service import compute_diff

router = APIRouter()


@router.post("", response_model=DiffResponse)
def diff(req: DiffRequest) -> DiffResponse:
    return compute_diff(req)
