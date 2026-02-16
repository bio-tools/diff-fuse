from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ArrayGroup:
    label: str
    per_doc: dict[str, tuple[bool, Any | None]]


def group_by_key(
    *,
    path: str,
    per_doc_arrays: dict[str, tuple[bool, Any | None]],
    key: str,
) -> list[ArrayGroup]:
    """
    Keyed grouping for arrays of objects.

    Requirements:
    - each present value is a list
    - each element is a dict
    - dict contains `key`
    - the key value is scalar-ish (str/int/float/bool/None)

    If requirements not met, raise ValueError. (Caller decides how to surface.)
    """
    # Collect per-doc maps: id_str -> element
    per_doc_map: dict[str, dict[str, Any]] = {}
    order: list[str] = []  # stable group ordering

    def id_str(v: Any) -> str:
        # keep simple and stable
        return "null" if v is None else str(v)

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
            ident = id_str(elem[key])
            if ident in seen:
                raise ValueError(f"Keyed mode: duplicate id '{ident}' for key '{key}' at '{path}' (doc '{doc_id}').")
            seen.add(ident)
            m[ident] = elem
            if ident not in order:
                order.append(ident)

        per_doc_map[doc_id] = m

    # Add ids seen only in later docs (if first docs were missing)
    all_ids: set[str] = set(order)
    for doc_id, m in per_doc_map.items():
        for ident in m.keys():
            if ident not in all_ids:
                order.append(ident)
                all_ids.add(ident)

    groups: list[ArrayGroup] = []
    for ident in order:
        per_doc: dict[str, tuple[bool, Any | None]] = {}
        for doc_id, (present, _) in per_doc_arrays.items():
            if not present:
                per_doc[doc_id] = (False, None)
                continue
            elem = per_doc_map.get(doc_id, {}).get(ident, None)
            if elem is None:
                per_doc[doc_id] = (False, None)
            else:
                per_doc[doc_id] = (True, elem)
        groups.append(ArrayGroup(label=f"{key}={ident}", per_doc=per_doc))

    return groups
