from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class PathGetResult:
    present: bool
    value: Any | None = None


def _parse_segments(path: str) -> list[tuple[str, list[str]]]:
    """
    Parse a path like: a.b[0].c[name=test]
    into segments: [("a", []), ("b", ["0"]), ("c", ["name=test"])]

    We support bracket segments for numeric indices and arbitrary labels.
    For key suggestion we mostly need indices like [0].
    """
    if path == "":
        return []

    parts = path.split(".")
    out: list[tuple[str, list[str]]] = []

    for part in parts:
        base = part
        brackets: list[str] = []
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
        out.append((base, brackets))
    return out


def get_at_path(root: Any, path: str) -> PathGetResult:
    """
    Return the value at path. Missing keys/indices => present=False.
    """
    if path == "":
        return PathGetResult(True, root)

    cur = root
    for key, brackets in _parse_segments(path):
        if not isinstance(cur, dict) or key not in cur:
            return PathGetResult(False, None)
        cur = cur[key]

        # Apply any bracket selectors (typically numeric indices)
        for b in brackets:
            if isinstance(cur, list) and b.isdigit():
                i = int(b)
                if i < 0 or i >= len(cur):
                    return PathGetResult(False, None)
                cur = cur[i]
            else:
                # For now we don't support selecting keyed labels in access
                # because suggestions operate on array nodes, not array element paths.
                raise ValueError(
                    f"Unsupported bracket selector '[{b}]' in path '{path}'. "
                    "Use this endpoint with an array node path (no keyed element selectors)."
                )

    return PathGetResult(True, cur)
