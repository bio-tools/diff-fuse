from __future__ import annotations

import pytest

from diff_fuse.api.schemas.diff import DiffStatus, NodeKind
from diff_fuse.core.diff import build_diff_tree


@pytest.mark.parametrize(
    ("docs", "expected_root_status", "expected_child_statuses"),
    [
        # identical nested objects => same everywhere
        (
            {
                "a": (True, {"x": 1, "y": {"z": "hi"}}),
                "b": (True, {"y": {"z": "hi"}, "x": 1}),
            },
            DiffStatus.same,
            {"x": DiffStatus.same, "y": DiffStatus.same},
        ),
        # missing field in one doc => missing at that node, and missing bubbles up
        (
            {
                "a": (True, {"x": 1, "y": 2}),
                "b": (True, {"x": 1}),
            },
            DiffStatus.missing,
            {"x": DiffStatus.same, "y": DiffStatus.missing},
        ),
        # scalar differs => diff at leaf and bubbles up
        (
            {
                "a": (True, {"x": 1}),
                "b": (True, {"x": 2}),
            },
            DiffStatus.diff,
            {"x": DiffStatus.diff},
        ),
    ],
)
def test_object_tree_diff(docs, expected_root_status, expected_child_statuses):
    root = build_diff_tree(path="", key=None, per_doc_values=docs)

    assert root.kind == NodeKind.object
    assert root.status == expected_root_status

    by_key = {c.key: c for c in root.children}
    assert set(by_key.keys()) == set(expected_child_statuses.keys())

    for k, st in expected_child_statuses.items():
        assert by_key[k].status == st


@pytest.mark.parametrize(
    ("docs", "expected_status"),
    [
        # type mismatch at same path => type_error
        (
            {"a": (True, {"x": 1}), "b": (True, {"x": "1"})},
            DiffStatus.type_error,
        ),
    ],
)
def test_type_error(docs, expected_status):
    root = build_diff_tree(path="", key=None, per_doc_values=docs)
    child = next(c for c in root.children if c.key == "x")
    assert child.status == expected_status


@pytest.mark.parametrize(
    ("docs", "expected_kind", "expected_status"),
    [
        ({"a": (True, 1), "b": (True, 1)}, NodeKind.scalar, DiffStatus.same),
        ({"a": (True, 1), "b": (True, 2)}, NodeKind.scalar, DiffStatus.diff),
        ({"a": (True, 1), "b": (False, None)}, NodeKind.scalar, DiffStatus.missing),
    ],
)
def test_scalar_root(docs, expected_kind, expected_status):
    root = build_diff_tree(path="", key=None, per_doc_values=docs)
    assert root.kind == expected_kind
    assert root.status == expected_status
