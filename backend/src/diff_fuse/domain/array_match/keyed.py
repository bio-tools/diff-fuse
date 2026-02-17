"""
Key-based array alignment.

This module implements a pragmatic array matching strategy for arrays of
objects (dicts): align elements by a user-provided key field.

Given a mapping of documents to an array value at some path, we produce a list
of `ArrayGroup` instances where each group represents "the same element" across
documents based on the element's identifier value for the chosen key.

Example
-------
If `key="id"` and the arrays contain objects like `{"id": 10, "name": "A"}`,
then elements with `id=10` are aligned together across documents.

The diff builder uses these groups to build per-element child paths such as:

- "steps[id=10]"
- "steps[id=foo].name"

Requirements / limitations
--------------------------
Keyed alignment is only defined for arrays where:
- each present value is a list
- each element is a dict
- each dict contains the chosen key
- within a document, key values are unique (no duplicates)

If any requirement is violated, this module raises ValueError so the caller can
surface a user-facing error (typically as a `type_error` diff node with a message).

Ordering
--------
Groups are returned in a stable order derived from the first time each identifier
is encountered while scanning documents in the input iteration order and elements
in their array order. This gives the UI a deterministic, human-sensible ordering.
"""

from typing import Any

from diff_fuse.models.arrays import ArrayGroup
from diff_fuse.models.document import RootInput


def group_by_key(
    *,
    path: str,
    per_doc_arrays: dict[str, tuple[bool, Any | None]],
    key: str,
) -> list[ArrayGroup]:
    """
    Align arrays of objects by an identifier field.

    Parameters
    ----------
    path : str
        Canonical path of the array node (used only for error messages).
    per_doc_arrays : dict[str, tuple[bool, Any | None]]
        Mapping of `doc_id -> (present, value)` where:
        - present=False means the array path does not exist in that document
        - present=True means the array path exists and `value` must be a list
    key : str
        Object field name used to identify and align elements across documents.

    Returns
    -------
    list[ArrayGroup]
        Aligned groups for each identifier value observed across documents.

    Raises
    ------
    ValueError
        If keyed alignment cannot be applied because:
        - a present array value is not a list
        - an element is not an object (dict)
        - the key is missing in an element
        - a document contains duplicate identifier values for the key

    Notes
    -----
    Identifier normalization:
    - Identifiers are normalized to strings for matching and labels.
      `None` is normalized to the literal string "null".

    This is intentionally conservative and format-agnostic:
    it does not attempt to guess identities when the chosen key is unreliable.
    """
    # doc_id -> { ident_str -> element_dict }
    per_doc_map: dict[str, dict[str, Any]] = {}
    order: list[str] = []  # stable identifier ordering as first-seen

    def _id_str(v: Any) -> str:
        # Keep simple and stable across JSON scalar-ish values.
        return "null" if v is None else str(v)

    # Build per-document maps and a stable ordering of identifiers.
    for doc_id, (present, v) in per_doc_arrays.items():
        if not present:
            continue

        if not isinstance(v, list):
            raise ValueError(f"Keyed mode expects a list at '{path}' (doc '{doc_id}').")

        m: dict[str, Any] = {}
        seen: set[str] = set()

        for elem in v:
            if not isinstance(elem, dict):
                raise ValueError(f"Keyed mode expects object elements at '{path}' (doc '{doc_id}').")
            if key not in elem:
                raise ValueError(f"Keyed mode: key '{key}' missing in an element at '{path}' (doc '{doc_id}').")

            ident = _id_str(elem[key])

            if ident in seen:
                raise ValueError(f"Keyed mode: duplicate id '{ident}' for key '{key}' at '{path}' (doc '{doc_id}').")

            seen.add(ident)
            m[ident] = elem

            if ident not in order:
                order.append(ident)

        per_doc_map[doc_id] = m

    # Defensive: include identifiers that might appear only in later documents.
    all_ids: set[str] = set(order)
    for _, m in per_doc_map.items():
        for ident in m.keys():
            if ident not in all_ids:
                order.append(ident)
                all_ids.add(ident)

    # Emit groups in stable order.
    groups: list[ArrayGroup] = []
    for ident in order:
        per_doc: dict[str, RootInput] = {}
        for doc_id, (present, _) in per_doc_arrays.items():
            if not present:
                per_doc[doc_id] = (False, None)
                continue

            elem = per_doc_map.get(doc_id, {}).get(ident)
            if elem is None:
                per_doc[doc_id] = (False, None)
            else:
                per_doc[doc_id] = (True, elem)

        groups.append(ArrayGroup(label=f"{key}={ident}", per_doc=per_doc))

    return groups
