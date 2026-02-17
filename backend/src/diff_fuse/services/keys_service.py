"""
Array key suggestion service.

This module provides the service-layer functionality for suggesting keys for
array elements. Given a session and an array-node path,
it inspects the array elements across documents and returns a ranked list
of candidate keys that are likely to uniquely identify elements for
keyed array matching.
"""

from typing import Any

from diff_fuse.api.dto.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse
from diff_fuse.domain.array_keys import suggest_keys_for_array
from diff_fuse.domain.path_access import get_value_at_path
from diff_fuse.models.array_keys import KeySuggestion
from diff_fuse.models.document import DocumentResult
from diff_fuse.services.shared import fetch_session


def _collect_arrays_at_path(
    documents_results: list[DocumentResult],
    *,
    path: str,
) -> dict[str, list[Any]]:
    """
    Collect array values at a given path across documents.

    Parameters
    ----------
    documents_results : list[DocumentResult]
        Per-document parse/normalization results. Only documents with
        `normalized` content are eligible.
    path : str
        Canonical path to an array node.

    Returns
    -------
    dict[str, list[Any]]
        Mapping `doc_id -> array_value` for documents where:
        - the document parsed successfully
        - the path exists
        - the value at the path is a JSON array

    Notes
    -----
    - If the path exists but is not an array, it is ignored here.
    - If the path is invalid, `get_value_at_path` will raise InvalidPath.
    """
    arrays_by_doc: dict[str, list[Any]] = {}

    for doc_res in documents_results:
        normalized = doc_res.normalized
        if normalized is None:
            continue

        presence = get_value_at_path(root=normalized, path=path)
        if not presence.present:
            continue

        if not isinstance(presence.value, list):
            continue

        arrays_by_doc[doc_res.doc_id] = presence.value

    return arrays_by_doc


def compute_key_suggestions(
    documents_results: list[DocumentResult],
    *,
    path: str,
    top_k: int,
) -> list[KeySuggestion]:
    """
    Compute ranked key suggestions for an array node.

    Parameters
    ----------
    documents_results : list[DocumentResult]
        Per-document parse/normalization results for a session.
    path : str
        Canonical array-node path.
    top_k : int
        Maximum number of suggestions to return.

    Returns
    -------
    list[KeySuggestion]
        Ranked list of suggested keys (best first).
        Empty if no viable suggestions are found.
    """
    arrays_by_doc = _collect_arrays_at_path(documents_results, path=path)
    return suggest_keys_for_array(arrays_by_doc, top_k=top_k)


def suggest_array_keys_in_session(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    """
    Suggest candidate keys for keyed array matching within a session.

    Parameters
    ----------
    session_id : str
        Identifier of the session containing normalized documents.
    req : SuggestArrayKeysRequest
        Request payload containing:
        - path: array node path
        - top_k: maximum number of suggestions

    Returns
    -------
    SuggestArrayKeysResponse
        Response containing the original path and ranked key suggestions.

    Raises
    ------
    SessionNotFound
        If the session does not exist.
    InvalidPath
        If `req.path` is not a valid canonical path.
    """
    s = fetch_session(session_id)

    suggestions = compute_key_suggestions(
        s.documents_results,
        path=req.path,
        top_k=req.top_k,
    )

    return SuggestArrayKeysResponse(path=req.path, suggestions=suggestions)
