from __future__ import annotations

from diff_fuse.api.schemas.array_keys import SuggestArrayKeysRequest, SuggestArrayKeysResponse, SuggestedKey
from diff_fuse.api.schemas.diff import DiffRequest, DiffResponse
from diff_fuse.api.schemas.merge import MergeRequest, MergeResponse
from diff_fuse.api.schemas.session import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionDiffRequest,
    SessionMergeRequest,
)
from diff_fuse.core.array_keys import suggest_keys_for_array
from diff_fuse.core.normalize import DocumentParseError, parse_and_normalize_json
from diff_fuse.core.path_access import get_at_path
from diff_fuse.core.session_store import SessionStore
from diff_fuse.services.diff_service import compute_diff
from diff_fuse.services.merge_service import compute_merge

_store = SessionStore(ttl_minutes=60)


def create_session(req: CreateSessionRequest) -> CreateSessionResponse:
    s = _store.create(req.documents)
    return CreateSessionResponse(session_id=s.session_id)


def diff_in_session(session_id: str, req: SessionDiffRequest) -> DiffResponse:
    s = _store.get(session_id)
    if s is None:
        raise KeyError(session_id)
    return compute_diff(DiffRequest(documents=s.documents, array_strategies=req.array_strategies))


def merge_in_session(session_id: str, req: SessionMergeRequest) -> MergeResponse:
    s = _store.get(session_id)
    if s is None:
        raise KeyError(session_id)

    merge_req = MergeRequest(
        documents=DiffRequest(documents=s.documents, array_strategies=req.array_strategies),
        selections=req.selections,
    )
    return compute_merge(merge_req)


def suggest_array_keys_in_session(session_id: str, req: SuggestArrayKeysRequest) -> SuggestArrayKeysResponse:
    s = _store.get(session_id)
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
