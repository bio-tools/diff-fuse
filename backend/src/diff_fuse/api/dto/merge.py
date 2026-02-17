from __future__ import annotations

from typing import Any

from pydantic import Field

from diff_fuse.models.api import APIModel
from diff_fuse.models.document import DocumentResult
from diff_fuse.models.merge import MergeSelection

from .diff import DiffRequest


class MergeRequest(APIModel):
    # Keep same shape as diff request to avoid frontend duplication.
    diff_request: DiffRequest = Field(..., description="Original diff request. Used also for merge computation.")
    selections: dict[str, MergeSelection] = Field(
        default_factory=dict,
        description="Map path -> selection (doc/manual).",
    )


class MergeResponse(APIModel):
    documents_results: list[DocumentResult]
    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)
