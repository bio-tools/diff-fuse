from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ArrayGroup:
    """
    A group represents "the same element" across docs (by index for index mode).
    `label` is used in the path segment: arr[<label>]
    """

    label: str
    per_doc: dict[str, tuple[bool, Any | None]]  # doc_id -> (present, element_value)


def group_by_index(
    *,
    path: str,
    per_doc_arrays: dict[str, tuple[bool, Any | None]],
) -> list[ArrayGroup]:
    """
    per_doc_arrays: doc_id -> (present, value) where value is list if present.

    Produces groups for indices 0..max_len-1. Missing indices are (False, None).
    """
    arrays: dict[str, list[Any]] = {}
    max_len = 0

    for doc_id, (present, v) in per_doc_arrays.items():
        if not present:
            continue
        if not isinstance(v, list):
            # caller should handle type checks; we keep this strict.
            raise TypeError(f"Expected list at '{path}' for doc '{doc_id}', got {type(v)!r}")
        arrays[doc_id] = v
        max_len = max(max_len, len(v))

    groups: list[ArrayGroup] = []
    for i in range(max_len):
        per_doc: dict[str, tuple[bool, Any | None]] = {}
        for doc_id, (present, _) in per_doc_arrays.items():
            if not present:
                per_doc[doc_id] = (False, None)
                continue
            arr = arrays.get(doc_id, [])
            if i < len(arr):
                per_doc[doc_id] = (True, arr[i])
            else:
                per_doc[doc_id] = (False, None)
        groups.append(ArrayGroup(label=str(i), per_doc=per_doc))

    return groups
