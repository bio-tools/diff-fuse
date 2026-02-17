"""
Array key suggestion API routes.

This module exposes endpoints for suggesting candidate key fields for
array-of-object structures within a session's documents.

The suggestions help users choose effective keyed array merge strategies
by identifying fields that are likely to uniquely identify elements
(e.g., "id", "name", etc.).
"""

from fastapi import APIRouter

from diff_fuse.api.dto.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse
from diff_fuse.services.keys_service import suggest_array_keys_in_session

router = APIRouter()


@router.post("/{session_id}/arrays/suggest-keys", response_model=SuggestArrayKeysResponse)
def suggest_keys(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    """
    Suggest candidate key fields for an array node within a session.

    This endpoint analyzes the array located at the provided canonical path
    across all session documents and returns ranked key candidates that may
    be suitable for keyed array matching.

    Parameters
    ----------
    session_id : str
        Identifier of the session containing the documents to analyze.
    req : SuggestArrayKeysRequest
        Request containing:
        - `path`: canonical path to the target array node
        - `top_k`: maximum number of suggestions to return

    Returns
    -------
    SuggestArrayKeysResponse
        Ranked list of suggested key fields with scoring metadata.

    Raises
    ------
    DomainError
        If the session does not exist or has expired.
    InvalidPath
        If the provided path is malformed or unsupported.

    Notes
    -----
    - Only arrays of objects are meaningful for key suggestion.
    - Documents that fail parsing are ignored for suggestion purposes.
    - Suggestions are heuristic and should be treated as guidance,
      not guarantees of uniqueness.
    """
    return suggest_array_keys_in_session(session_id, req)
