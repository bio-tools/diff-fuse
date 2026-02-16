from __future__ import annotations

from pydantic import BaseModel, Field

from diff_fuse.api.schemas.diff import ArrayStrategy, InputDocument
from diff_fuse.api.schemas.merge import MergeSelection


class CreateSessionRequest(BaseModel):
    documents: list[InputDocument] = Field(..., min_length=2)


class CreateSessionResponse(BaseModel):
    session_id: str


class SessionDiffRequest(BaseModel):
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)


class SessionMergeRequest(BaseModel):
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)
    selections: dict[str, MergeSelection] = Field(default_factory=dict)
