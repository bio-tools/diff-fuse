from fastapi import APIRouter

from diff_fuse.api.dto.merge import MergeRequest, MergeResponse
from diff_fuse.services.session_service import merge_in_session

router = APIRouter()


@router.post("/{session_id}/merge", response_model=MergeResponse)
def merge(session_id: str, req: MergeRequest) -> MergeResponse:
    return merge_in_session(session_id, req)
