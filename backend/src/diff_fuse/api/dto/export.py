from __future__ import annotations

from typing import Any

from pydantic import Field

from diff_fuse.models.api import APIModel

from .merge import MergeRequest


class ExportRequest(APIModel):
    merge_request: MergeRequest = Field(..., description="Original merge request. Used also for export.")
    pretty: bool = True
    require_resolved: bool = False


class ExportTextResponse(APIModel):
    unresolved_paths: list[str] = Field(default_factory=list)
    text: str
