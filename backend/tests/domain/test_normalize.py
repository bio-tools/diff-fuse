from __future__ import annotations

import pytest

from diff_fuse.domain.errors import DocumentParseError, LimitsExceededError
from diff_fuse.domain.normalize import parse_and_normalize_json


@pytest.mark.parametrize(
    "raw, expected",
    [
        ('{"b": 1, "a": 2}', {"a": 2, "b": 1}),
        ('{"z": {"b": 1, "a": 2}, "a": 0}', {"a": 0, "z": {"a": 2, "b": 1}}),
        ("[3,2,1]", [3, 2, 1]),
        ("null", None),
        ('"x"', "x"),
    ],
)
def test_parse_and_normalize_json_deterministic(raw, expected):
    out = parse_and_normalize_json(raw)
    assert out == expected


@pytest.mark.parametrize(
    "raw",
    [
        "{",  # invalid JSON
        '{"a":',  # invalid JSON
        "[1,2,]",  # invalid JSON
        "\ud800",  # invalid surrogate (encoding edge)
    ],
)
def test_parse_json_invalid_raises(raw):
    with pytest.raises(DocumentParseError):
        parse_and_normalize_json(raw)


def test_normalize_json_depth_limit(monkeypatch):
    # Force a tiny depth limit
    monkeypatch.setenv("DIFF_FUSE_MAX_JSON_DEPTH", "1")

    # reset settings singleton after env change
    import diff_fuse.settings as settings

    settings._settings = None  # type: ignore[attr-defined]

    # depth here: root object (depth=0) -> key "a" value is object (depth=1) -> key "b" is object (depth=2) => exceeds
    raw = '{"a":{"b":{"c":1}}}'
    with pytest.raises(LimitsExceededError):
        parse_and_normalize_json(raw)
