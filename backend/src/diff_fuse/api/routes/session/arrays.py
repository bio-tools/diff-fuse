from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.services.session_service import suggest_array_keys_in_session

router = APIRouter()


class SuggestArrayKeysRequest(APIModel):
    path: str = Field(..., description="Array node path (e.g. 'steps' or 'a.b[0].steps').")
    top_k: int = Field(default=10, ge=1, le=50)


class SuggestedKey(APIModel):
    key: str
    score: float
    present_ratio: float
    unique_ratio: float
    scalar_ratio: float
    example_values: list[str]


class SuggestArrayKeysResponse(APIModel):
    path: str
    suggestions: list[SuggestedKey]


@router.post("/{session_id}/arrays/suggest-keys", response_model=SuggestArrayKeysResponse)
def suggest_keys(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    try:
        return suggest_array_keys_in_session(session_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
