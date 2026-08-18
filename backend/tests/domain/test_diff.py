from __future__ import annotations

import pytest

from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.models.arrays import ArrayStrategy, ArrayStrategyMode
from diff_fuse.models.diff import DiffStatus, NodeKind, NullMode


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

    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies_by_node_id={},
    )

    # root is object; child x is what we're testing
    x = next(c for c in root.children if c.key == "x")
    assert x.status == expected_status
    assert x.kind == NodeKind.scalar


def test_diff_type_mismatch_is_type_error():
    root_inputs = {
        "A": (True, {"x": 1}),
        "B": (True, {"x": "one"}),
    }

    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies_by_node_id={},
    )

    x = next(c for c in root.children if c.key == "x")
    assert x.status == DiffStatus.type_error
    assert x.message and "type mismatch" in x.message


def test_diff_array_index_alignment_marks_missing_indices():
    root_inputs = {
        "A": (True, {"arr": [1, 2]}),
        "B": (True, {"arr": [1]}),
    }

    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies_by_node_id={},
    )

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

    # First build once to discover the node_id of the "items" array node.
    root0 = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies_by_node_id={},
    )
    items0 = next(c for c in root0.children if c.key == "items")

    # keyed mode but missing key -> should surface type_error at that array node
    array_strategies_by_node_id = {
        items0.node_id: ArrayStrategy(mode=ArrayStrategyMode.keyed, key=None)
    }

    root = build_stable_root_diff_tree(
        per_doc_values=root_inputs,
        array_strategies_by_node_id=array_strategies_by_node_id,
    )

    items = next(c for c in root.children if c.key == "items")
    assert items.status == DiffStatus.type_error
    assert items.message and "requires 'key'" in items.message

# --- null handling -------------------------------------------------------


def _child(per_doc_values, key, **kwargs):
    root = build_stable_root_diff_tree(
        per_doc_values=per_doc_values,
        array_strategies_by_node_id=kwargs.pop("array_strategies_by_node_id", {}),
        **kwargs,
    )
    return root, next(c for c in root.children if c.key == key)


@pytest.mark.parametrize(
    "docs, expected_status",
    [
        # null and an absent key both mean "no value", so the documents agree.
        ({"A": {"x": None}, "B": {}}, DiffStatus.same),
        ({"A": {"x": None}, "B": {"x": None}}, DiffStatus.same),
        # exactly one real value, some documents lack it
        ({"A": {"x": None}, "B": {"x": 2}}, DiffStatus.missing),
        ({"A": {"x": None}, "B": {}, "C": {"x": 2}}, DiffStatus.missing),
        # two real types genuinely conflict
        ({"A": {"x": None}, "B": {}, "C": {"x": 2}, "D": {"x": "pew"}}, DiffStatus.type_error),
    ],
)
def test_null_counts_as_no_value(docs, expected_status):
    per_doc_values = {doc_id: (True, doc) for doc_id, doc in docs.items()}
    _, x = _child(per_doc_values, "x")

    assert x.status == expected_status
    assert x.kind == NodeKind.scalar


def test_null_conflict_message_omits_null():
    per_doc_values = {
        "A": (True, {"x": None}),
        "B": (True, {"x": 2}),
        "C": (True, {"x": "pew"}),
    }
    _, x = _child(per_doc_values, "x")

    assert x.status == DiffStatus.type_error
    assert x.message == "type mismatch at 'x': number vs string"
    assert "null" not in x.message


def test_null_document_still_reports_its_null_value():
    """The fold must not hide that a document explicitly held null."""
    _, lic = _child({"A": (True, {"license": None}), "B": (True, {"license": "MIT"})}, "license")

    assert lic.per_doc["A"].present is True
    assert lic.per_doc["A"].value_type == "null"
    assert lic.per_doc["B"].value_type == "string"


def test_null_mode_value_preserves_type_error():
    _, lic = _child(
        {"A": (True, {"license": None}), "B": (True, {"license": "MIT"})},
        "license",
        null_mode=NullMode.value,
    )

    assert lic.status == DiffStatus.type_error
    assert lic.message and "null vs string" in lic.message


def test_null_vs_object_expands_into_object_node():
    _, cfg = _child({"A": (True, {"cfg": None}), "B": (True, {"cfg": {"b": 1}})}, "cfg")

    assert cfg.kind == NodeKind.object
    assert cfg.status == DiffStatus.missing
    assert cfg.per_doc["A"].value_type == "null"

    b = next(c for c in cfg.children if c.key == "b")
    assert b.status == DiffStatus.missing
    assert b.per_doc["A"].present is False
    assert b.per_doc["B"].value == 1


def test_null_vs_array_expands_into_array_node():
    _, arr = _child({"A": (True, {"arr": None}), "B": (True, {"arr": [1, 2]})}, "arr")

    assert arr.kind == NodeKind.array
    assert arr.status == DiffStatus.missing
    assert len(arr.children) == 2
    assert all(c.per_doc["A"].present is False for c in arr.children)


@pytest.mark.parametrize("empty", [{}, []])
def test_null_vs_empty_container(empty):
    _, node = _child({"A": (True, {"c": None}), "B": (True, {"c": empty})}, "c")

    assert node.kind == (NodeKind.object if empty == {} else NodeKind.array)
    assert node.children == []
    assert node.status == DiffStatus.missing


def test_null_array_element_folds_under_index_mode():
    _, arr = _child({"A": (True, {"arr": ["a", None]}), "B": (True, {"arr": ["a", "b"]})}, "arr")

    assert arr.children[0].status == DiffStatus.same
    assert arr.children[1].status == DiffStatus.missing


def test_null_document_root():
    root = build_stable_root_diff_tree(
        per_doc_values={"A": (True, None), "B": (True, {"x": 1})},
        array_strategies_by_node_id={},
    )

    assert root.kind == NodeKind.object
    assert root.per_doc["A"].value_type == "null"

    x = next(c for c in root.children if c.key == "x")
    assert x.per_doc["A"].present is False
    assert x.per_doc["B"].value == 1


def test_all_null_document_roots_agree():
    root = build_stable_root_diff_tree(
        per_doc_values={"A": (True, None), "B": (True, None)},
        array_strategies_by_node_id={},
    )

    assert root.kind == NodeKind.scalar
    assert root.status == DiffStatus.same
