from pydantic import Field

from diff_fuse.models.api import APIModel
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.diff import DiffNode
from diff_fuse.models.document import DocumentResult


class DiffRequest(APIModel):
    array_strategies: dict[str, ArrayStrategy] = Field(default_factory=dict)


class DiffResponse(APIModel):
    root: DiffNode
