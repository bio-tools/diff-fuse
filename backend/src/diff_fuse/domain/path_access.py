"""
Path access utilities for normalized JSON documents.

This module provides lightweight helpers for retrieving values from
normalized document structures using the canonical path syntax produced
by the diff engine (e.g., "a.b[0].c").

Design goals
------------
- Work directly on normalized Python structures (dict/list/scalars).
- Mirror the path semantics used by DiffNode.path.

Current limitations
-------------------
- Only numeric array indices (e.g., "[0]") are supported.
- Keyed array selectors (e.g., "[id=foo]") are intentionally rejected.
- Paths must follow the canonical dot/bracket format.
"""

from typing import Any

from diff_fuse.domain.normalize import json_type
from diff_fuse.models.diff import ValuePresence


def _parse_segments(path: str) -> list[tuple[str, list[str]]]:
    """
    Parse a canonical path into traversal segments.

    Parameters
    ----------
    path : str
        Canonical path string.

    Returns
    -------
    list[tuple[str, list[str]]]
        A list of segments where each entry is:
        - (object_key, bracket_selectors)

    Raises
    ------
    ValueError
        If the path contains malformed bracket syntax or empty segments.

    Notes
    -----
    Bracket selectors are returned as raw strings. Interpretation is
    performed later during traversal.

    Examples
    --------
    "a.b[0].c" -> [("a", []), ("b", ["0"]), ("c", [])]
    "items[0].name" -> [("items", ["0"]), ("name", [])]
    "arr[0][1].x" -> [("arr", ["0", "1"]), ("x", [])]
    """
    if path == "":
        return []

    parts = path.split(".")
    segments: list[tuple[str, list[str]]] = []

    for part in parts:
        base = part
        brackets: list[str] = []

        # Extract bracket selectors iteratively
        while True:
            lb = base.find("[")
            if lb == -1:
                break

            rb = base.find("]", lb + 1)
            if rb == -1:
                raise ValueError(f"Invalid path (missing ']'): {path}")

            brackets.append(base[lb + 1 : rb])
            base = base[:lb] + base[rb + 1 :]

        if base == "":
            raise ValueError(f"Invalid path segment: {part!r} in {path!r}")

        segments.append((base, brackets))

    return segments


def get_value_at_path(root: Any, path: str) -> ValuePresence:
    """
    Retrieve the value at a canonical path within a normalized document.

    Parameters
    ----------
    root : Any
        Normalized JSON-like structure (dict/list/scalars).
    path : str
        Canonical path string as produced by the diff engine.

    Returns
    -------
    ValuePresence
        Presence/value information at the requested path.
        - present=False → path does not exist
        - present=True → path exists (value may still be None/null)

    Raises
    ------
    ValueError
        If the path uses unsupported bracket selectors (e.g., keyed
        selectors like "[id=foo]") or malformed syntax.

    Notes
    -----
    Supported traversal:
    - Object keys via dot notation.
    - Array indices via numeric brackets.

    Not supported (by design):
    - Keyed array selectors.
    - Non-numeric bracket selectors.

    This function is intentionally strict to avoid ambiguous behavior
    and to keep key-suggestion logic predictable.
    """
    # Root access
    if path == "":
        return ValuePresence(
            present=True,
            value=root,
            value_type=json_type(root),
        )

    cur = root

    for key, brackets in _parse_segments(path):
        # Object step
        if not isinstance(cur, dict) or key not in cur:
            return ValuePresence(present=False, value=None, value_type=None)

        cur = cur[key]

        # Apply bracket selectors (array indices)
        for b in brackets:
            if isinstance(cur, list) and b.isdigit():
                idx = int(b)
                if idx < 0 or idx >= len(cur):
                    return ValuePresence(present=False, value=None, value_type=None)
                cur = cur[idx]
            else:
                raise ValueError(
                    f"Unsupported bracket selector '[{b}]' in path '{path}'. Only numeric array indices are supported."
                )

    return ValuePresence(
        present=True,
        value=cur,
        value_type=json_type(cur),
    )
