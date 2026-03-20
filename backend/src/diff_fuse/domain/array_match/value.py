"""
Value-based array alignment.

This module implements an array matching strategy that aligns elements by their
scalar value. This is only applicable for arrays of JSON scalars (string/number/boolean/null).
Given a mapping of documents to an array value at some path, we produce a list
of `ArrayGroup` instances where each group represents "the same element" across
documents for a particular scalar value. Missing arrays and missing values are
represented explicitly via `(present=False, value=None)`.

Example
-------
If the arrays contain strings like `["A", "B", "C"]`, then elements
with value "A" are aligned together across documents, and so on.

The diff builder uses these groups to create per-element diff tree nodes using
canonical array paths such as:

- "steps[foo]" for an element with value "foo"
- "steps[null]" for an element with value null
- "[foo]" for a root array element with value "foo"

Requirements / limitations
--------------------------
This strategy is only defined for arrays where:
- each present value is a list
- each element is a JSON scalar (string/number/boolean/null)
- within a document, values are unique (no duplicates)

Ordering
--------
Groups are returned in a stable order derived from the first time each value is
encountered while scanning documents in the input iteration order and elements
in their array order.
"""


from typing import Any

from diff_fuse.models.arrays import ArrayGroup, ArraySelector, ArrayStrategyMode
from diff_fuse.models.document import ValueInput


def group_by_value(
    *,
    path: str,
    per_doc_arrays: dict[str, ValueInput],
) -> list[ArrayGroup]:
    """
    Align arrays of scalars by value.

    Parameters
    ----------
    path : str
        Canonical path of the array node (used only for error messages).
    per_doc_arrays : dict[str, ValueInput]
        Mapping of `doc_id -> (present, value)` where:
        - present=False means the array path does not exist in that document
        - present=True means the array path exists and value must be a list of scalars

    Returns
    -------
    list[ArrayGroup]
        Aligned groups for each unique scalar value across all arrays.

    Raises
    ------
    ValueError
        If any present value is not a list of scalars, or if there are duplicate
        values within a document.
    """
    per_doc_map: dict[str, dict[str, Any]] = {}
    order: list[str] = []
    seen_global: set[str] = set()

    def _is_scalar(v: Any) -> bool:
        return v is None or isinstance(v, (str, int, float, bool))

    def _value_str(v: Any) -> str:
        return "null" if v is None else str(v)

    for doc_id, (present, v) in per_doc_arrays.items():
        if not present:
            continue

        if not isinstance(v, list):
            raise ValueError(f"Value mode expects a list at '{path}' (doc '{doc_id}').")

        m: dict[str, Any] = {}
        seen_doc: set[str] = set()

        for elem in v:
            if not _is_scalar(elem):
                raise ValueError(f"Value mode expects scalar elements at '{path}' (doc '{doc_id}').")

            ident = _value_str(elem)

            if ident in seen_doc:
                raise ValueError(f"Value mode: duplicate scalar value '{ident}' at '{path}' (doc '{doc_id}').")

            seen_doc.add(ident)
            m[ident] = elem

            if ident not in seen_global:
                seen_global.add(ident)
                order.append(ident)

        per_doc_map[doc_id] = m

    groups: list[ArrayGroup] = []
    for ident in order:
        per_doc: dict[str, ValueInput] = {}

        for doc_id, (present, _) in per_doc_arrays.items():
            if not present:
                per_doc[doc_id] = (False, None)
                continue

            elem = per_doc_map.get(doc_id, {}).get(ident)
            if elem is None:
                per_doc[doc_id] = (False, None)
            else:
                per_doc[doc_id] = (True, elem)

        groups.append(
            ArrayGroup(
                label=ident,
                per_doc=per_doc,
                selector=ArraySelector(
                    mode=ArrayStrategyMode.value,
                    value=ident,
                ),
            )
        )

    return groups
