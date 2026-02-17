from fastapi import APIRouter

from diff_fuse.api.dto.session import CreateSessionRequest, CreateSessionResponse
from diff_fuse.services.session_service import create_session

router = APIRouter()


@router.post("/", response_model=CreateSessionResponse)
def create(req: CreateSessionRequest) -> CreateSessionResponse:
    return create_session(req)
