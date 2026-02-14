from __future__ import annotations

import pytest

from diff_fuse.api.schemas.diff import ArrayStrategy, ArrayStrategyMode, DiffStatus, NodeKind
from diff_fuse.core.diff import build_diff_tree


@pytest.mark.parametrize(
    ("a", "b", "expected_child_keys", "expected_status"),
    [
        ([1, 2], [1, 2], ["0", "1"], DiffStatus.same),
        ([1, 2], [1, 3], ["0", "1"], DiffStatus.diff),
        ([1, 2], [1], ["0", "1"], DiffStatus.missing),
    ],
)
def test_array_index_mode(a, b, expected_child_keys, expected_status):
    root = build_diff_tree(
        path="arr",
        key="arr",
        per_doc_values={"A": (True, a), "B": (True, b)},
        array_strategies={"arr": ArrayStrategy(mode=ArrayStrategyMode.index)},
    )
    assert root.kind == NodeKind.array
    assert [c.key for c in root.children] == expected_child_keys
    assert root.status == expected_status


def test_array_keyed_mode_basic():
    a = [{"name": "build", "t": 1}, {"name": "test", "t": 2}]
    b = [{"name": "test", "t": 999}, {"name": "build", "t": 1}]

    root = build_diff_tree(
        path="steps",
        key="steps",
        per_doc_values={"A": (True, a), "B": (True, b)},
        array_strategies={"steps": ArrayStrategy(mode=ArrayStrategyMode.keyed, key="name")},
    )

    assert root.kind == NodeKind.array
    assert [c.key for c in root.children] == ["name=build", "name=test"]

    # test element has diff at t
    test_node = next(c for c in root.children if c.key == "name=test")
    t_child = next(c for c in test_node.children if c.key == "t")
    assert t_child.status == DiffStatus.diff


def test_array_keyed_mode_invalid_becomes_type_error():
    # element missing key => should surface as type_error on the array node
    a = [{"name": "ok"}]
    b = [{"nope": "bad"}]

    root = build_diff_tree(
        path="steps",
        key="steps",
        per_doc_values={"A": (True, a), "B": (True, b)},
        array_strategies={"steps": ArrayStrategy(mode=ArrayStrategyMode.keyed, key="name")},
    )

    assert root.kind == NodeKind.array
    assert root.status == DiffStatus.type_error
    assert root.children == []
