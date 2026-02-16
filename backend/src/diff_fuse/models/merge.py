from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class MergeSelection(BaseModel):
    kind: Literal["doc", "manual"] = Field(..., description="How this path is resolved.")
    doc_id: str | None = Field(default=None, description="Required when kind='doc'.")
    manual_value: Any | None = Field(default=None, description="Required when kind='manual'.")

    def to_internal(self) -> tuple[str, str | None, Any | None]:
        return (self.kind, self.doc_id, self.manual_value)
