from __future__ import annotations

import pytest

from diff_fuse.core.normalize import (
    DocumentParseError,
    json_type,
    normalize_json,
    parse_and_normalize_json,
    parse_json,
)


@pytest.mark.parametrize(
    ("content", "expected"),
    [
        ('{"b": 1, "a": 2}', {"a": 2, "b": 1}),
        ('{"z": {"b": 1, "a": 2}, "a": 0}', {"a": 0, "z": {"a": 2, "b": 1}}),
        (
            '{"arr": [{"b": 1, "a": 2}, {"d": 4, "c": 3}], "x": 1}',
            {"arr": [{"a": 2, "b": 1}, {"c": 3, "d": 4}], "x": 1},
        ),
        # scalars
        ("true", True),
        ("null", None),
        ('"hello"', "hello"),
        ("123", 123),
        ("12.5", 12.5),
        # arrays (order preserved)
        ("[3, 2, 1]", [3, 2, 1]),
        ('[{"b":2,"a":1}, {"y":0,"x":9}]', [{"a": 1, "b": 2}, {"x": 9, "y": 0}]),
    ],
)
def test_parse_and_normalize_json(content: str, expected):
    parsed = parse_and_normalize_json(content)
    assert parsed.normalized == expected


@pytest.mark.parametrize(
    "content",
    [
        "",  # empty
        "{",  # incomplete
        '{"a":}',  # invalid
        '{"a": 1,}',  # trailing comma not allowed in JSON
        "tru",  # invalid literal
    ],
)
def test_parse_json_invalid_raises(content: str):
    with pytest.raises(DocumentParseError):
        parse_json(content)


@pytest.mark.parametrize(
    ("value", "expected_type"),
    [
        (None, "null"),
        (True, "boolean"),
        (False, "boolean"),
        (0, "number"),
        (12.5, "number"),
        ("x", "string"),
        ([], "array"),
        ({}, "object"),
        ({"a": [1, 2, 3]}, "object"),
    ],
)
def test_json_type(value, expected_type: str):
    assert json_type(value) == expected_type


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ({"b": 1, "a": 2}, {"a": 2, "b": 1}),
        ({"z": {"b": 1, "a": 2}, "a": 0}, {"a": 0, "z": {"a": 2, "b": 1}}),
        ([{"b": 1, "a": 2}, {"d": 4, "c": 3}], [{"a": 2, "b": 1}, {"c": 3, "d": 4}]),
        ([3, 2, 1], [3, 2, 1]),
        ("hello", "hello"),
        (123, 123),
        (True, True),
        (None, None),
    ],
)
def test_normalize_json(value, expected):
    assert normalize_json(value) == expected
