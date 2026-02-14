from __future__ import annotations

import pytest

from diff_fuse.api.schemas.diff import ArrayStrategy, ArrayStrategyMode
from diff_fuse.core.diff import build_diff_tree
from diff_fuse.core.merge import Selection, merge_from_diff_tree


@pytest.mark.parametrize(
    ("a", "b", "selections", "expected"),
    [
        # Override one element
        (
            [1, 2],
            [1, 99],
            {"arr[1]": Selection.from_doc("B")},
            [1, 99],
        ),
        # Take whole array from B
        (
            [1, 2],
            [3, 4],
            {"arr": Selection.from_doc("B")},
            [3, 4],
        ),
        # Take array from B but override element 0 from A
        (
            [10, 20],
            [30, 40],
            {"arr": Selection.from_doc("B"), "arr[0]": Selection.from_doc("A")},
            [10, 40],
        ),
    ],
)
def test_merge_arrays_index_mode(a, b, selections, expected):
    root = build_diff_tree(
        path="arr",
        key="arr",
        per_doc_values={"A": (True, a), "B": (True, b)},
        array_strategies={"arr": ArrayStrategy(mode=ArrayStrategyMode.index)},
    )
    merged = merge_from_diff_tree(root, selections)
    assert merged == expected


def test_merge_arrays_keyed_mode_override_leaf():
    a = [{"name": "build", "t": 1}, {"name": "test", "t": 2}]
    b = [{"name": "test", "t": 999}, {"name": "build", "t": 1}]

    root = build_diff_tree(
        path="steps",
        key="steps",
        per_doc_values={"A": (True, a), "B": (True, b)},
        array_strategies={"steps": ArrayStrategy(mode=ArrayStrategyMode.keyed, key="name")},
    )

    merged = merge_from_diff_tree(root, {"steps[name=test].t": Selection.from_doc("B")})
    assert merged == [{"name": "build", "t": 1}, {"name": "test", "t": 999}]
