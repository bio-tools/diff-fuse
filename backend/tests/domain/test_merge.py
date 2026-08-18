from __future__ import annotations

import pytest

from diff_fuse.domain.diff import build_stable_root_diff_tree
from diff_fuse.domain.merge import try_merge_from_diff_tree_with_refs
from diff_fuse.models.arrays import ArrayStrategy, ArrayStrategyMode
from diff_fuse.models.diff import NullMode
from diff_fuse.models.merge import DocMergeSelection, ManualMergeSelection


def _root(doc_a, doc_b):
    return build_stable_root_diff_tree(
        per_doc_values={"A": (True, doc_a), "B": (True, doc_b)},
        array_strategies_by_node_id={},
    )


def test_merge_auto_resolves_same_and_missing():
    root = _root({"x": 1, "y": 2}, {"x": 1})

    merged, unresolved, refs = try_merge_from_diff_tree_with_refs(root, selections={})

    x_node = next(c for c in root.children if c.key == "x")
    y_node = next(c for c in root.children if c.key == "y")

    assert unresolved == []
    assert merged == {"x": 1, "y": 2}

    assert refs[root.node_id].present is True

    assert refs[x_node.node_id].present is True
    assert refs[x_node.node_id].object_key == "x"
    assert refs[x_node.node_id].array_index is None

    assert refs[y_node.node_id].present is True
    assert refs[y_node.node_id].object_key == "y"
    assert refs[y_node.node_id].array_index is None


def test_merge_conflicting_leaf_without_selection_is_unresolved_and_omitted():
    root = _root({"x": 1}, {"x": 2})

    merged, unresolved, refs = try_merge_from_diff_tree_with_refs(root, selections={})

    x_node = next(c for c in root.children if c.key == "x")

    assert x_node.node_id in unresolved
    # best-effort merge omits unresolved node
    assert merged == {}

    assert refs[root.node_id].present is True
    assert refs[x_node.node_id].present is False
    assert refs[x_node.node_id].object_key is None
    assert refs[x_node.node_id].array_index is None


@pytest.mark.parametrize(
    "selection, expected_value",
    [
        (DocMergeSelection(doc_id="A"), 1),
        (DocMergeSelection(doc_id="B"), 2),
        (ManualMergeSelection(manual_value=99), 99),
    ],
)
def test_merge_conflicting_leaf_resolves_with_selection(selection, expected_value):
    root = _root({"x": 1}, {"x": 2})
    x_node = next(c for c in root.children if c.key == "x")

    merged, unresolved, refs = try_merge_from_diff_tree_with_refs(
        root,
        selections={x_node.node_id: selection},
    )

    assert unresolved == []
    assert merged == {"x": expected_value}

    assert refs[root.node_id].present is True
    assert refs[x_node.node_id].present is True
    assert refs[x_node.node_id].object_key == "x"
    assert refs[x_node.node_id].array_index is None


def test_merge_inherited_selection_applies_to_descendants():
    root = _root({"a": {"b": 1, "c": 10}}, {"a": {"b": 2, "c": 10}})

    a_node = next(c for c in root.children if c.key == "a")
    b_node = next(c for c in a_node.children if c.key == "b")
    c_node = next(c for c in a_node.children if c.key == "c")

    merged, unresolved, refs = try_merge_from_diff_tree_with_refs(
        root,
        selections={a_node.node_id: DocMergeSelection(doc_id="A")},
    )

    assert unresolved == []
    assert merged == {"a": {"b": 1, "c": 10}}

    assert refs[root.node_id].present is True

    assert refs[a_node.node_id].present is True
    assert refs[a_node.node_id].object_key == "a"
    assert refs[a_node.node_id].array_index is None

    assert refs[b_node.node_id].present is True
    assert refs[b_node.node_id].object_key == "b"
    assert refs[b_node.node_id].array_index is None

    assert refs[c_node.node_id].present is True
    assert refs[c_node.node_id].object_key == "c"
    assert refs[c_node.node_id].array_index is None

# --- null handling -------------------------------------------------------


def _merged(doc_a, doc_b, selections=None, **kwargs):
    root = build_stable_root_diff_tree(
        per_doc_values={"A": (True, doc_a), "B": (True, doc_b)},
        array_strategies_by_node_id={},
        **kwargs,
    )
    merged, unresolved, _ = try_merge_from_diff_tree_with_refs(root, selections=selections or {})
    return root, merged, unresolved


@pytest.mark.parametrize(
    "doc_a, doc_b",
    [
        ({"license": None}, {"license": "MIT"}),
        ({"license": "MIT"}, {"license": None}),
    ],
)
def test_merge_real_value_beats_null_in_either_order(doc_a, doc_b):
    """Document order must not decide the outcome."""
    _, merged, unresolved = _merged(doc_a, doc_b)

    assert merged == {"license": "MIT"}
    assert unresolved == []


def test_merge_falsy_values_are_not_treated_as_null():
    doc = {"n": 0, "b": False, "s": ""}
    _, merged, unresolved = _merged(doc, doc)

    assert merged == doc
    assert unresolved == []


def test_merge_null_and_absent_key_yields_null():
    _, merged, unresolved = _merged({"x": None}, {})

    assert merged == {"x": None}
    assert unresolved == []


def test_merge_null_vs_container_takes_the_container():
    _, merged, _ = _merged({"cfg": None}, {"cfg": {"b": 1}})
    assert merged == {"cfg": {"b": 1}}

    _, merged, _ = _merged({"arr": None}, {"arr": [1, 2]})
    assert merged == {"arr": [1, 2]}


def test_merge_null_vs_empty_container_is_not_null():
    _, merged, _ = _merged({"arr": None}, {"arr": []})
    assert merged == {"arr": []}

    _, merged, _ = _merged({"o": None}, {"o": {}})
    assert merged == {"o": {}}


def test_merge_empty_containers_survive():
    """A childless container must merge to {} / [], never to null."""
    doc = {"o": {}, "a": []}
    _, merged, unresolved = _merged(doc, doc)

    assert merged == doc
    assert unresolved == []


def test_merge_selecting_the_null_document_yields_null():
    """Explicitly choosing the null document stays the escape hatch."""
    root = build_stable_root_diff_tree(
        per_doc_values={"A": (True, {"license": None}), "B": (True, {"license": "MIT"})},
        array_strategies_by_node_id={},
    )
    lic = next(c for c in root.children if c.key == "license")

    merged, unresolved, _ = try_merge_from_diff_tree_with_refs(
        root, selections={lic.node_id: DocMergeSelection(doc_id="A")}
    )

    assert merged == {"license": None}
    assert unresolved == []


def test_merge_null_mode_value_leaves_conflict_unresolved():
    root, merged, unresolved = _merged(
        {"license": None}, {"license": "MIT"}, null_mode=NullMode.value
    )
    lic = next(c for c in root.children if c.key == "license")

    assert merged == {}
    assert unresolved == [lic.node_id]


def test_merge_keeps_null_array_element_under_value_mode():
    """A literal null element must not be confused with an absent one."""
    doc = {"arr": [None, "x"]}
    probe = build_stable_root_diff_tree(
        per_doc_values={"A": (True, doc), "B": (True, doc)},
        array_strategies_by_node_id={},
    )
    arr = next(c for c in probe.children if c.key == "arr")

    root = build_stable_root_diff_tree(
        per_doc_values={"A": (True, doc), "B": (True, doc)},
        array_strategies_by_node_id={arr.node_id: ArrayStrategy(mode=ArrayStrategyMode.value)},
    )
    merged, unresolved, _ = try_merge_from_diff_tree_with_refs(root, selections={})

    assert merged == doc
    assert unresolved == []
