from __future__ import annotations

import pytest

from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.models.arrays import ArrayStrategy, ArrayStrategyMode
from diff_fuse.models.diff import DiffStatus, NodeKind


@pytest.mark.parametrize(
    "a, b, expected_status",
    [
        ({"x": 1}, {"x": 1}, DiffStatus.same),
        ({"x": 1}, {"x": 2}, DiffStatus.diff),
        ({"x": 1}, {}, DiffStatus.missing),
    ],
)
def test_diff_scalar_statuses(a, b, expected_status):
    root_inputs = {
        "A": (True, a),
        "B": (True, b),
    }

    root = build_stable_root_diff_tree(per_doc_values=root_inputs, array_strategies={})
    # root is object; child x is what we're testing
    x = next(c for c in root.children if c.key == "x")
    assert x.status == expected_status
    assert x.kind == NodeKind.scalar


def test_diff_type_mismatch_is_type_error():
    root_inputs = {
        "A": (True, {"x": 1}),
        "B": (True, {"x": "one"}),
    }
    root = build_stable_root_diff_tree(per_doc_values=root_inputs, array_strategies={})
    x = next(c for c in root.children if c.key == "x")
    assert x.status == DiffStatus.type_error
    assert x.message and "type mismatch" in x.message


def test_diff_array_index_alignment_marks_missing_indices():
    root_inputs = {
        "A": (True, {"arr": [1, 2]}),
        "B": (True, {"arr": [1]}),
    }
    root = build_stable_root_diff_tree(per_doc_values=root_inputs, array_strategies={})
    arr = next(c for c in root.children if c.key == "arr")
    assert arr.kind == NodeKind.array

    # should have children for indices 0 and 1
    idx0 = next(c for c in arr.children if c.key == "0")
    idx1 = next(c for c in arr.children if c.key == "1")

    assert idx0.status in {DiffStatus.same, DiffStatus.diff, DiffStatus.missing}
    assert idx1.status == DiffStatus.missing
    assert idx1.per_doc["A"].present is True
    assert idx1.per_doc["B"].present is False


def test_diff_keyed_strategy_invalid_without_key_is_type_error():
    root_inputs = {
        "A": (True, {"items": [{"id": 1}, {"id": 2}]}),
        "B": (True, {"items": [{"id": 1}, {"id": 3}]}),
    }
    # keyed mode but missing key -> should surface type_error at that array node
    array_strategies = {"items": ArrayStrategy(mode=ArrayStrategyMode.keyed, key=None)}
    root = build_stable_root_diff_tree(per_doc_values=root_inputs, array_strategies=array_strategies)

    items = next(c for c in root.children if c.key == "items")
    assert items.status == DiffStatus.type_error
    assert items.message and "requires 'key'" in items.message
