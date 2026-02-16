from __future__ import annotations

from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.array_strategies import ArrayStrategy
from diff_fuse.api.schemas.diff import DiffNode
from diff_fuse.api.schemas.document import DocumentMeta, InputDocument


class DiffRequest(APIModel):
    documents: list[InputDocument] = Field(..., min_length=2)
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)


class DiffResponse(APIModel):
    documents: list[DocumentMeta]
    root: DiffNode
