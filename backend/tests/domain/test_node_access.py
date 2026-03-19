from __future__ import annotations

import pytest

from diff_fuse.domain.errors import InvalidPathError
from diff_fuse.domain.node_access import get_value_at_node_tokens
from diff_fuse.domain.node_ids import decode_node_id, encode_node_id


@pytest.mark.parametrize(
    "root, tokens, present, expected_value",
    [
        ({"a": 1}, [], True, {"a": 1}),
        ({"a": {"b": [10, 20]}}, [("o", "a"), ("o", "b"), ("i", 0)], True, 10),
        ({"a": {"b": [10, 20]}}, [("o", "a"), ("o", "b"), ("i", 1)], True, 20),
        ({"a": {"b": [10, 20]}}, [("o", "a"), ("o", "b"), ("i", 2)], False, None),
        ({"a": {"b": [10, 20]}}, [("o", "a"), ("o", "c")], False, None),
        (
            {"items": [{"id": "x", "v": 1}, {"id": "y", "v": 2}]},
            [("o", "items"), ("k", "id", "y"), ("o", "v")],
            True,
            2,
        ),
        (
            {"items": [{"id": None, "v": 3}]},
            [("o", "items"), ("k", "id", "null"), ("o", "v")],
            True,
            3,
        ),
    ],
)
def test_get_value_at_node_tokens(root, tokens, present, expected_value):
    vp = get_value_at_node_tokens(root=root, tokens=tokens)
    assert vp.present is present
    if present:
        assert vp.value == expected_value
    else:
        assert vp.value is None


def test_get_value_at_node_tokens_invalid_token_kind_raises():
    with pytest.raises(InvalidPathError):
        get_value_at_node_tokens(root={"a": 1}, tokens=[("z", "a")])


def test_encode_decode_node_id_roundtrip():
    tokens = [("o", "a"), ("o", "b"), ("i", 1)]
    node_id = encode_node_id(tokens)
    assert decode_node_id(node_id) == tokens