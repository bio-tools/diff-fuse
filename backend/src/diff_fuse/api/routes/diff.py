from __future__ import annotations

from fastapi import APIRouter
from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.diff import DiffNode, DocumentMeta, InputDocument
from diff_fuse.api.schemas.shared import ArrayStrategies
from diff_fuse.services.diff_service import compute_diff

router = APIRouter()

class DiffRequest(APIModel):
    """
    Request payload for computing a diff across multiple documents.
    TODO: inherit?

    Attributes
    ----------
    documents : list[InputDocument]
        Input documents to compare. Must contain at least two documents.
    array_strategies : dict[str, ArrayStrategy]
        Mapping from array node path -> strategy to use for that array.

        If a path is not present, the backend uses a default strategy (currently:
        index-based matching).
    """

    documents: list[InputDocument] = Field(..., min_length=2)
    array_strategies: ArrayStrategies = Field(default_factory=dict)


class DiffResponse(APIModel):
    """
    Response payload for a diff request.

    Attributes
    ----------
    documents : list[DocumentMeta]
        Per-document parse/validation results.
    root : DiffNode
        Root of the diff tree. The root node has `path=""` and typically
        `kind="object"`.

    Notes
    -----
    If all documents fail to parse, the backend may still return a stable root node
    so the UI can render predictable structure while displaying parse errors in
    `documents`.
    """

    documents: list[DocumentMeta]
    root: DiffNode


@router.post("", response_model=DiffResponse)
def diff(req: DiffRequest) -> DiffResponse:
    return compute_diff(req)
