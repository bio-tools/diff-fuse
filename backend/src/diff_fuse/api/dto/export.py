from __future__ import annotations

from typing import Any

from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.array_strategies import ArrayStrategy
from diff_fuse.api.schemas.merge import MergeSelection


class ExportRequest(APIModel):
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)
    selections: dict[str, MergeSelection] = Field(default_factory=dict)
    pretty: bool = True
    require_resolved: bool = False


class ExportTextResponse(APIModel):
    merged: Any
    unresolved_paths: list[str] = Field(default_factory=list)
    text: str
