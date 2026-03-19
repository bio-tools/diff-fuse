from __future__ import annotations

import pytest

from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.domain.merge import try_merge_from_diff_tree
from diff_fuse.models.merge import DocMergeSelection, ManualMergeSelection


def _root(doc_a, doc_b):
    return build_stable_root_diff_tree(
        per_doc_values={"A": (True, doc_a), "B": (True, doc_b)},
        array_strategies_by_node_id={},
    )


def test_merge_auto_resolves_same_and_missing():
    root = _root({"x": 1, "y": 2}, {"x": 1})
    merged, unresolved = try_merge_from_diff_tree(root, selections={})
    assert unresolved == []
    assert merged == {"x": 1, "y": 2}


def test_merge_conflicting_leaf_without_selection_is_unresolved_and_omitted():
    root = _root({"x": 1}, {"x": 2})
    merged, unresolved = try_merge_from_diff_tree(root, selections={})
    x_node = next(c for c in root.children if c.key == "x")
    assert x_node.node_id in unresolved
    # best-effort merge omits unresolved node
    assert merged == {}


@pytest.mark.parametrize(
    "selection, expected",
    [
        (DocMergeSelection(doc_id="A"), {"x": 1}),
        (DocMergeSelection(doc_id="B"), {"x": 2}),
        (ManualMergeSelection(manual_value=99), {"x": 99}),
    ],
)
def test_merge_conflicting_leaf_resolves_with_selection(selection, expected):
    root = _root({"x": 1}, {"x": 2})
    x_node = next(c for c in root.children if c.key == "x")
    merged, unresolved = try_merge_from_diff_tree(root, selections={x_node.node_id: selection})
    assert unresolved == []
    assert merged == expected


def test_merge_inherited_selection_applies_to_descendants():
    root = _root({"a": {"b": 1, "c": 10}}, {"a": {"b": 2, "c": 10}})
    a_node = next(c for c in root.children if c.key == "a")
    merged, unresolved = try_merge_from_diff_tree(
        root,
        selections={a_node.node_id: DocMergeSelection(doc_id="A")},
    )
    assert unresolved == []
    assert merged == {"a": {"b": 1, "c": 10}}