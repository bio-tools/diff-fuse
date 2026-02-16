from __future__ import annotations

from typing import Any

from pydantic import Field

from diff_fuse.models.document import DocumentMeta
from diff_fuse.models.merge import MergeSelection

from .api import APIModel
from .diff import DiffRequest


class MergeRequest(APIModel):
    # Keep same shape as diff request to avoid frontend duplication.
    documents: DiffRequest = Field(..., description="Same as /api/diff request payload.")
    selections: dict[str, MergeSelection] = Field(
        default_factory=dict,
        description="Map path -> selection (doc/manual).",
    )


class MergeResponse(APIModel):
    documents: list[DocumentMeta]
    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)
