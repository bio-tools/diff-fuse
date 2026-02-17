from pydantic import Field

from diff_fuse.models.api import APIModel
from diff_fuse.models.array_keys import KeySuggestion


class SuggestArrayKeysRequest(APIModel):
    path: str = Field(..., description="Array node path (e.g. 'steps' or 'a.b[0].steps').")
    top_k: int = Field(default=-1, ge=1, le=50)


class SuggestArrayKeysResponse(APIModel):
    path: str
    suggestions: list[KeySuggestion]
