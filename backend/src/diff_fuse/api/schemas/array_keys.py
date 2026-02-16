from __future__ import annotations

from pydantic import BaseModel, Field


class SuggestArrayKeysRequest(BaseModel):
    path: str = Field(..., description="Array node path (e.g. 'steps' or 'a.b[0].steps').")
    top_k: int = Field(default=10, ge=1, le=50)


class SuggestedKey(BaseModel):
    key: str
    score: float
    present_ratio: float
    unique_ratio: float
    scalar_ratio: float
    example_values: list[str]


class SuggestArrayKeysResponse(BaseModel):
    path: str
    suggestions: list[SuggestedKey]
