"""
Node access utilities for normalized JSON documents.

This module provides lightweight helpers for retrieving values from
normalized document structures using the canonical node ID syntax produced
by the diff engine (e.g., "n1_...").

Design goals
------------
- Work directly on normalized Python structures (dict/list/scalars).
- Mirror the node ID semantics used by DiffNode.node_id.
- Provide stable opaque identifiers that are decoupled from path syntax.
- Support decoding node IDs to retrieve the corresponding path tokens for traversal.
"""


from typing import Any

from diff_fuse.domain.errors import InvalidPathError
from diff_fuse.domain.normalize import json_type
from diff_fuse.models.diff import ValuePresence


def get_value_at_node_tokens(root: Any, tokens: list[tuple]) -> ValuePresence:
    """
    Traverse the JSON structure from the root using the provided node tokens
    and return the value presence information at the target node.

    Parameters
    ----------
    root : Any
        The root of the JSON structure.
    tokens : list[tuple]
        The list of tokens representing the path from the root to the target node.
        Each token is a tuple where the first element indicates the token type:
        - ("o", <object_key:str>) for object key access
        - ("i", <index:int>) for array index access
        - ("k", <field_name:str>, <field_value:str>) for keyed array access

    Returns
    -------
    ValuePresence
        An object containing:
        - present: whether the node exists in the structure
            - present=False -> path does not exist
            - present=True -> path exists (value may still be None/null)
        - value: the value at the node (if present)
        - value_type: the JSON type of the value (if present)

    Raises
    ------
    InvalidPathError
        If the tokens contain an unsupported kind or if the traversal encounters a
        type mismatch (e.g., trying to access an index on a non-array).
    """
    cur = root

    for token in tokens:
        kind = token[0]

        if kind == "o":
            key = token[1]
            if not isinstance(cur, dict) or key not in cur:
                return ValuePresence(present=False, value=None, value_type=None)
            cur = cur[key]

        elif kind == "i":
            idx = token[1]
            if not isinstance(cur, list) or idx < 0 or idx >= len(cur):
                return ValuePresence(present=False, value=None, value_type=None)
            cur = cur[idx]

        elif kind == "k":
            field_name = token[1]
            field_value = token[2]
            if not isinstance(cur, list):
                return ValuePresence(present=False, value=None, value_type=None)

            found = None
            for elem in cur:
                if isinstance(elem, dict):
                    v = elem.get(field_name)
                    v_norm = "null" if v is None else str(v)
                    if v_norm == field_value:
                        found = elem
                        break

            if found is None:
                return ValuePresence(present=False, value=None, value_type=None)

            cur = found

        else:
            raise InvalidPathError("", f"Unsupported node token kind: {kind}")

    return ValuePresence(
        present=True,
        value=cur,
        value_type=json_type(cur),
    )
