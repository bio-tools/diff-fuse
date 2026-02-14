from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from diff_fuse.core.normalize import JsonType, json_type


@dataclass(frozen=True)
class FlatEntry:
    path: str
    value: Any
    value_type: JsonType


def join_path(base: str, key: str) -> str:
    if base == "":
        return key
    return f"{base}.{key}"


def flatten_object_scalars(value: Any, base_path: str = "") -> list[FlatEntry]:
    """
    Flatten only object/scalar structure into a list of entries (path -> value).

    - Objects are traversed recursively.
    - Scalars are emitted as leaf entries.
    - Arrays are NOT traversed yet (treated as leaf entries with type 'array').

    This is intentionally conservative because array diff strategy is configurable
    and will be handled separately.
    """
    t = json_type(value)

    # Scalars (including null, boolean, number, string) are leaves
    if t in {"null", "boolean", "number", "string"}:
        return [FlatEntry(path=base_path, value=value, value_type=t)]

    # Arrays are leaves for now
    if t == "array":
        return [FlatEntry(path=base_path, value=value, value_type=t)]

    # Objects are traversed
    if t == "object":
        assert isinstance(value, Mapping)
        entries: list[FlatEntry] = []
        for k, v in value.items():
            child_path = join_path(base_path, str(k))
            entries.extend(flatten_object_scalars(v, base_path=child_path))
        # Special case: an empty object has no leaves; still represent it
        if not entries:
            entries.append(FlatEntry(path=base_path, value=value, value_type=t))
        return entries

    raise TypeError(f"Unsupported type for flattening: {type(value)!r}")
