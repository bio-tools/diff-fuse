from fastapi import APIRouter

from diff_fuse.api.dto.diff import DiffRequest, DiffResponse
from diff_fuse.services.diff_service import diff_in_session

router = APIRouter()


@router.post("/{session_id}/diff", response_model=DiffResponse)
def diff(session_id: str, req: DiffRequest) -> DiffResponse:
    return diff_in_session(session_id, req)
