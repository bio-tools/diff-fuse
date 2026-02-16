from __future__ import annotations

import pytest

from diff_fuse.api.schemas.diff import DiffStatus
from diff_fuse.domain.diff import build_diff_tree
from diff_fuse.domain.merge import MergeConflictError, Selection, merge_from_diff_tree


@pytest.mark.parametrize(
    ("docs", "selections", "expected"),
    [
        # same => auto merge
        (
            {
                "a": (True, {"x": 1, "y": 2}),
                "b": (True, {"y": 2, "x": 1}),
            },
            {},
            {"x": 1, "y": 2},
        ),
        # missing field in one doc => include it (safe, since no conflicting value)
        (
            {
                "a": (True, {"x": 1, "y": 2}),
                "b": (True, {"x": 1}),
            },
            {},
            {"x": 1, "y": 2},
        ),
        # scalar root
        (
            {"a": (True, 5), "b": (True, 5)},
            {},
            5,
        ),
    ],
)
def test_merge_autoresolve_same_missing(docs, selections, expected):
    root = build_diff_tree(path="", key=None, per_doc_values=docs)
    assert root.status in (DiffStatus.same, DiffStatus.missing)
    merged = merge_from_diff_tree(root, selections)
    assert merged == expected


@pytest.mark.parametrize(
    ("docs", "selections", "expected_unresolved"),
    [
        # diff leaf requires selection
        (
            {"a": (True, {"x": 1}), "b": (True, {"x": 2})},
            {},
            ["x"],
        ),
        # type error requires selection (even if selection will later be rejected in UI)
        (
            {"a": (True, {"x": 1}), "b": (True, {"x": "1"})},
            {},
            ["x"],
        ),
    ],
)
def test_merge_conflict_without_selection(docs, selections, expected_unresolved):
    root = build_diff_tree(path="", key=None, per_doc_values=docs)
    with pytest.raises(MergeConflictError) as e:
        _ = merge_from_diff_tree(root, selections)
    assert e.value.unresolved_paths == expected_unresolved


def test_merge_with_leaf_selection_resolves_diff():
    docs = {"a": (True, {"x": 1}), "b": (True, {"x": 2})}
    root = build_diff_tree(path="", key=None, per_doc_values=docs)

    merged = merge_from_diff_tree(root, {"x": Selection.from_doc("b")})
    assert merged == {"x": 2}


def test_merge_subtree_selection_with_leaf_override():
    docs = {
        "a": (True, {"db": {"host": "local", "port": 1111}, "x": 1}),
        "b": (True, {"db": {"host": "prod", "port": 2222}, "x": 1}),
    }
    root = build_diff_tree(path="", key=None, per_doc_values=docs)

    # Take whole db from b, but override db.port from a
    selections = {
        "db": Selection.from_doc("b"),
        "db.port": Selection.from_doc("a"),
    }

    merged = merge_from_diff_tree(root, selections)
    assert merged == {"db": {"host": "prod", "port": 1111}, "x": 1}


def test_merge_manual_value_override():
    docs = {"a": (True, {"x": 1}), "b": (True, {"x": 2})}
    root = build_diff_tree(path="", key=None, per_doc_values=docs)

    merged = merge_from_diff_tree(root, {"x": Selection.from_manual(999)})
    assert merged == {"x": 999}


def test_merge_subtree_doc_missing_deletes_key():
    docs = {
        "a": (True, {"cfg": {"a": 1}}),
        "b": (True, {}),  # cfg missing in b
    }
    root = build_diff_tree(path="", key=None, per_doc_values=docs)

    # selecting cfg from b deletes it
    merged = merge_from_diff_tree(root, {"cfg": Selection.from_doc("b")})
    assert merged == {}
