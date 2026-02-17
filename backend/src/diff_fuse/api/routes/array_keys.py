from fastapi import APIRouter

from diff_fuse.api.dto.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse
from diff_fuse.services.session_service import suggest_array_keys_in_session

router = APIRouter()


@router.post("/{session_id}/arrays/suggest-keys", response_model=SuggestArrayKeysResponse)
def suggest_keys(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    return suggest_array_keys_in_session(session_id, req)
