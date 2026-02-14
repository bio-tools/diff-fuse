from __future__ import annotations

from fastapi import APIRouter

from diff_fuse.api.schemas.merge import MergeRequest, MergeResponse
from diff_fuse.services.merge_service import compute_merge

router = APIRouter()


@router.post("", response_model=MergeResponse)
def merge(req: MergeRequest) -> MergeResponse:
    return compute_merge(req)
