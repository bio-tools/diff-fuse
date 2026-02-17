from diff_fuse.api.dto.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse
from diff_fuse.domain.array_keys import suggest_keys_for_array
from diff_fuse.domain.path_access import get_value_at_path
from diff_fuse.models.array_keys import KeySuggestion
from diff_fuse.models.document import DocumentResult
from diff_fuse.services.shared import fetch_session


def get_suggestions(documents_results: list[DocumentResult], path: str, top_k: int) -> list[KeySuggestion]:
    arrays_by_doc: dict[str, list[object]] = {}

    for doc_res in documents_results:
        normalized = doc_res.normalized
        if normalized is None:
            continue

        val = get_value_at_path(root=normalized, path=path)
        if not val.present:
            continue

        if not isinstance(val.value, list):
            # If the path isn't an array, return empty suggestions (or can raise 400)
            continue

        arrays_by_doc[doc_res.doc_id] = val.value

    suggestions = suggest_keys_for_array(arrays_by_doc, top_k=top_k)
    return suggestions


def suggest_array_keys_in_session(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    s = fetch_session(session_id)

    suggestions = get_suggestions(
        documents_results=s.document_results,
        path=req.path,
        top_k=req.top_k,
    )

    return SuggestArrayKeysResponse(path=req.path, suggestions=suggestions)

