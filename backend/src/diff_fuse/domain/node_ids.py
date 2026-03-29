"""
Node ID encoding and decoding for diff tree nodes.

This module provides functions to generate stable, opaque node IDs based on the path
from the root to the node. The encoding is designed to be:
- Stable: same path always yields the same ID
- Opaque: no assumptions about the structure of the ID string
- Decodable: can be decoded back to the original path tokens for debugging purposes.
"""

import base64
import json
from typing import Any

# Token types:
# ("o", <object_key:str>)
# ("i", <index:int>)
# ("k", <field_name:str>, <field_value:str>)   # keyed array identity

Token = tuple[Any, ...]
PREFIX = "n1_"  # prefix to identify node IDs


def _b64url_no_pad(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _b64url_no_pad_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def decode_node_id(node_id: str) -> list[Token]:
    """
    Decode a node ID back into its structured tokens.

    Parameters
    ----------
    node_id : str
        The opaque node ID string.

    Returns
    -------
    list[Token]
        The list of tokens representing the path from the root to the node.
    """
    if not node_id.startswith(PREFIX):
        raise ValueError("Unsupported node id format")

    payload = node_id[len(PREFIX):]
    raw = _b64url_no_pad_decode(payload)
    tokens = json.loads(raw.decode("utf-8"))

    if not isinstance(tokens, list):
        raise ValueError("Invalid node id payload")

    return [tuple(t) for t in tokens]


def encode_node_id(tokens: list[Token]) -> str:
    """
    Encode structured tokens into a safe opaque id.

    Parameters
    ----------
    tokens : list[Token]
        Structured tokens representing the path from the root to a node.
        This is a list of tuples, where each tuple starts with a token type
        ("o", "key"), ("i", index), or ("k", field_name, field_value) and
        may contain additional data depending on the type.

    Returns
    -------
    str
        Opaque node ID string encoding the tokens.

    Notes
    -----
    - Stable across runs for same tokens
    - Delimiter-proof (no '.'/'[]' ambiguity)
    - Decodable for debugging (optional)
    """
    payload = json.dumps(tokens, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return PREFIX + _b64url_no_pad(payload)


def root_node_id() -> str:
    """Get the node ID for the root node."""
    return encode_node_id([])


def child_node_id(parent_tokens: list[Token], token: Token) -> tuple[str, list[Token]]:
    """
    Get the node ID for a child node given the parent's tokens and the token for the child edge.

    Parameters
    ----------
    parent_tokens : list[Token]
        Tokens for the parent node.
    token : Token
        Token representing the edge from the parent to the child.

    Returns
    -------
    tuple[str, list[Token]]
        A tuple of (child_node_id, child_tokens) where:
        - child_node_id is the encoded node ID for the child node
        - child_tokens is the list of tokens for the child node (parent_tokens + [token])
    """
    tokens = [*parent_tokens, token]
    return encode_node_id(tokens), tokens
