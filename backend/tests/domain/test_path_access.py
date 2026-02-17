from __future__ import annotations

import pytest

from diff_fuse.domain.errors import InvalidPathError
from diff_fuse.domain.path_access import get_value_at_path


@pytest.mark.parametrize(
    "root, path, present, expected_value",
    [
        ({"a": 1}, "", True, {"a": 1}),
        ({"a": {"b": [10, 20]}}, "a.b[0]", True, 10),
        ({"a": {"b": [10, 20]}}, "a.b[1]", True, 20),
        ({"a": {"b": [10, 20]}}, "a.b[2]", False, None),
        ({"a": {"b": [10, 20]}}, "a.c", False, None),
    ],
)
def test_get_value_at_path(root, path, present, expected_value):
    vp = get_value_at_path(root=root, path=path)
    assert vp.present is present
    if present:
        assert vp.value == expected_value
    else:
        assert vp.value is None


@pytest.mark.parametrize(
    "path",
    [
        "a..b",  # empty segment
        "a[b",  # missing ]
        "a[]",  # empty base after stripping
        "a[xyz]",  # non-numeric selector not supported
        "a[id=5]",  # keyed selector intentionally rejected
    ],
)
def test_get_value_at_path_invalid_path_raises(path):
    with pytest.raises(InvalidPathError):
        get_value_at_path(root={"a": [1, 2, 3]}, path=path)
