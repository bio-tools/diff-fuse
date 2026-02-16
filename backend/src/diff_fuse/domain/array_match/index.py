"""
Index-based array alignment.

This module implements the simplest array matching strategy: align elements by
their numeric index.

Given a mapping of documents to an array value at some path, we produce a list
of `ArrayGroup` instances where each group represents "the same element" across
documents for a particular index. Missing arrays and missing indices are
represented explicitly via `(present=False, value=None)`.

The diff builder uses these groups to create per-element diff tree nodes using
canonical array paths such as:

- "steps[0]"
- "steps[1].name"
- "[0]" for a root array

Notes
-----
This strategy assumes that index position is meaningful. For arrays where
elements are reordered or inserted/removed, this will produce noisy diffs.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ArrayGroup:
    """
    A group representing one aligned array element across documents.

    Each group corresponds to one array position (index) in index mode.
    For each document we record whether that element exists at this index and,
    if present, the element value.

    Attributes
    ----------
    label : str
        Human-readable label for the group. In index mode this is the index
        rendered as a string (e.g., "0", "1"). The label is used in canonical
        path segments by the diff builder: `arr[<label>]`.
    per_doc : dict[str, tuple[bool, Any | None]]
        Mapping of `doc_id -> (present, element_value)` where:
        - present=False means the array is missing or too short for this index
        - present=True means an element exists at this index and element_value
          is the element's JSON value (can be any JSON-compatible Python value)
    """

    label: str
    per_doc: dict[str, tuple[bool, Any | None]]  # doc_id -> (present, element_value)


def group_by_index(
    *,
    path: str,
    per_doc_arrays: dict[str, tuple[bool, Any | None]],
) -> list[ArrayGroup]:
    """
    Align arrays by numeric index.

    This produces one `ArrayGroup` per index from 0 to the maximum array length
    seen across all present documents. For documents where the array is missing
    or shorter than the maximum length, those indices are marked as absent.

    Parameters
    ----------
    path : str
        Canonical path of the array node (used only for error messages).
    per_doc_arrays : dict[str, tuple[bool, Any | None]]
        Mapping of `doc_id -> (present, value)` where:
        - present=False means the array path does not exist in that document
        - present=True means the array path exists and `value` must be a list

    Returns
    -------
    list[ArrayGroup]
        Aligned groups for indices 0..max_len-1.

    Raises
    ------
    TypeError
        If any present value is not a list.
    """
    arrays: dict[str, list[Any]] = {}
    max_len = 0

    # Validate inputs and find maximum length.
    for doc_id, (present, v) in per_doc_arrays.items():
        if not present:
            continue
        if not isinstance(v, list):
            raise TypeError(f"Expected list at '{path}' for doc '{doc_id}', got {type(v)!r}")
        arrays[doc_id] = v
        max_len = max(max_len, len(v))

    groups: list[ArrayGroup] = []

    # Produce one group per index up to the maximum observed length.
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
