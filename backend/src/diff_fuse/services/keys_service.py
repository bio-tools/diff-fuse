from __future__ import annotations

from diff_fuse.api.dto.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse, SuggestedKey
from diff_fuse.domain.array_keys import suggest_keys_for_array
from diff_fuse.domain.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.domain.path_access import get_at_path
from diff_fuse.state.session_store import sessions


def suggest_array_keys_in_session(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    s = sessions.get(session_id)
    if s is None:
        raise KeyError(session_id)

    arrays_by_doc: dict[str, list[object]] = {}

    for d in s.documents:
        try:
            normalized = parse_and_normalize_json(d.content).normalized
        except DocumentParseError:
            # skip docs that don't parse; UI already sees parse errors elsewhere
            continue

        got = get_at_path(normalized, req.path)
        if not got.present:
            continue

        if not isinstance(got.value, list):
            # If the path isn't an array, return empty suggestions (or you can raise 400)
            continue

        arrays_by_doc[d.doc_id] = got.value

    suggestions = suggest_keys_for_array(arrays_by_doc, top_k=req.top_k)
    return SuggestArrayKeysResponse(
        path=req.path,
        suggestions=[
            SuggestedKey(
                key=s.key,
                score=s.score,
                present_ratio=s.present_ratio,
                unique_ratio=s.unique_ratio,
                scalar_ratio=s.scalar_ratio,
                example_values=s.example_values,
            )
            for s in suggestions
        ],
    )
