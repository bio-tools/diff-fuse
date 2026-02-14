from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from diff_fuse.api.schemas.diff import DiffRequest, DocumentMeta


class MergeSelection(BaseModel):
    kind: Literal["doc", "manual"] = Field(..., description="How this path is resolved.")
    doc_id: str | None = Field(default=None, description="Required when kind='doc'.")
    manual_value: Any | None = Field(default=None, description="Required when kind='manual'.")

    def to_internal(self) -> tuple[str, str | None, Any | None]:
        return (self.kind, self.doc_id, self.manual_value)


class MergeRequest(BaseModel):
    # Keep same shape as diff request to avoid frontend duplication.
    documents: DiffRequest = Field(..., description="Same as /api/diff request payload.")
    selections: dict[str, MergeSelection] = Field(
        default_factory=dict,
        description="Map path -> selection (doc/manual).",
    )


class MergeResponse(BaseModel):
    documents: list[DocumentMeta]
    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)
