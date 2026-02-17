from diff_fuse.api.dto.diff import DiffRequest, DiffResponse
from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.models.arrays import ArrayStrategy
from diff_fuse.models.diff import DiffNode
from diff_fuse.models.document import RootInput
from diff_fuse.services.shared import fetch_session


def build_diff_response(
    root_inputs: dict[str, RootInput],
    array_strategies: dict[str, ArrayStrategy]
) -> DiffNode:
    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies=array_strategies,
    )
    return root


def diff_in_session(session_id: str, req: DiffRequest) -> DiffResponse:
    s = fetch_session(session_id)

    root = build_diff_response(
        root_inputs=s.root_inputs,
        array_strategies=req.array_strategies
    )

    return DiffResponse(root=root)
