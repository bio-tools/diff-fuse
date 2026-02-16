from __future__ import annotations

from diff_fuse.domain.diff import build_diff_tree


def test_container_nodes_do_not_embed_values():
    root = build_diff_tree(
        path="",
        key=None,
        per_doc_values={
            "A": (True, {"x": [1, 2], "y": {"z": 3}}),
            "B": (True, {"x": [1, 2], "y": {"z": 4}}),
        },
        array_strategies={},
    )

    # Root is object => values should be None
    assert root.per_doc["A"].present is True
    assert root.per_doc["A"].value is None
    assert root.per_doc["A"].value_type == "object"

    x = next(c for c in root.children if c.key == "x")
    assert x.per_doc["A"].value is None
    assert x.per_doc["A"].value_type == "array"

    y = next(c for c in root.children if c.key == "y")
    assert y.per_doc["A"].value is None
    assert y.per_doc["A"].value_type == "object"

    z = next(c for c in y.children if c.key == "z")
    # Scalar leaf should carry real value
    assert z.per_doc["A"].value == 3
    assert z.per_doc["A"].value_type == "number"
