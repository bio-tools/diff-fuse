from __future__ import annotations

from diff_fuse.api.dto.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse, SuggestedKey
from diff_fuse.domain.array_keys import suggest_keys_for_array
from diff_fuse.domain.path_access import get_at_path
from diff_fuse.services.shared import fetch_session


def suggest_array_keys_in_session(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    s = fetch_session(session_id)

    arrays_by_doc: dict[str, list[object]] = {}

    for doc_res in s.documents_results:
        normalized = doc_res.normalized
        if normalized is None:
            continue

        got = get_at_path(normalized, req.path)
        if not got.present:
            continue

        if not isinstance(got.value, list):
            # If the path isn't an array, return empty suggestions (or you can raise 400)
            continue

        arrays_by_doc[doc_res.doc_id] = got.value

    suggestions = suggest_keys_for_array(arrays_by_doc, top_k=req.top_k)
    return SuggestArrayKeysResponse(
        path=req.path,
        suggestions=[
            SuggestedKey(
                key=sugg.key,
                score=sugg.score,
                present_ratio=sugg.present_ratio,
                unique_ratio=sugg.unique_ratio,
                scalar_ratio=sugg.scalar_ratio,
                example_values=sugg.example_values,
            )
            for sugg in suggestions
        ],
    )
