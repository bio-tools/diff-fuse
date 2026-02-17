"""
JSON parsing and normalization utilities.

This module provides the canonical ingestion pipeline for JSON documents:

    raw text -> parsed Python -> normalized canonical structure

The normalization step ensures structural stability across documents so that
diff computation is deterministic and independent of superficial differences
such as object key ordering.

Design goals
------------
- Strict JSON compliance (via orjson)
- Deterministic structural normalization
- Clear error reporting for UI/API layers
- Future extensibility to non-JSON formats

Notes
-----
- Lists preserve order (JSON semantics).
- Object keys are recursively sorted during normalization.
- The output is always composed of standard Python JSON types:
  dict, list, str, int, float, bool, None.
"""

from dataclasses import dataclass
from typing import Any

import orjson

from diff_fuse.models.diff import JsonType


class DocumentParseError(ValueError):
    """
    Raised when an input document cannot be parsed as the declared format.
    """


@dataclass(frozen=True)
class ParsedDocument:
    """
    Parsed and normalized representation of a document.

    This structure separates the raw parsed data from the canonicalized form
    used by the diff engine.

    Attributes
    ----------
    data : Any
        Parsed JSON as standard Python objects. Object key ordering reflects
        the original input.
    normalized : Any
        Canonicalized representation where:
        - Object keys are sorted recursively.
        - Arrays preserve original order.
        - Scalars are unchanged.

    Notes
    -----
    The `normalized` form is what should be used for structural comparison
    and diff computation.
    """

    data: Any
    normalized: Any


def parse_json(content: str) -> Any:
    """
    Parse a JSON document strictly.

    Parameters
    ----------
    content : str
        Raw JSON text.

    Returns
    -------
    Any
        Parsed JSON value as standard Python types.

    Raises
    ------
    DocumentParseError
        If the input is not valid JSON or cannot be decoded as UTF-8.

    Notes
    -----
    - Accepts any valid JSON value (object, array, or scalar).
    - Uses `orjson` for performance and strictness.
    - The caller is responsible for subsequent normalization.
    """
    try:
        # orjson expects bytes
        return orjson.loads(content.encode("utf-8"))
    except orjson.JSONDecodeError as e:
        raise DocumentParseError(f"Invalid JSON: {e}") from e
    except UnicodeEncodeError as e:
        raise DocumentParseError("Invalid text encoding; expected UTF-8.") from e


def json_type(value: Any) -> JsonType:
    """
    Return the normalized JSON type label for a Python value.

    Parameters
    ----------
    value : Any
        Python value expected to represent JSON data.

    Returns
    -------
    JsonType
        One of: {"object", "array", "string", "number", "boolean", "null"}.

    Raises
    ------
    TypeError
        If the value is not representable in JSON.

    Notes
    -----
    - `bool` is checked before `int` because bool is a subclass of int.
    - This function is used throughout the diff engine to enforce type
      consistency across documents.
    """
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    raise TypeError(f"Unsupported (non-JSON) type: {type(value)!r}")


def normalize_json(value: Any) -> Any:
    """
    Canonicalize a JSON-compatible Python structure.

    The goal is to produce a deterministic representation suitable for
    structural comparison across documents.

    Parameters
    ----------
    value : Any
        Parsed JSON value.

    Returns
    -------
    Any
        Normalized JSON structure.

    Normalization rules
    -------------------
    object (dict)
        Keys are sorted lexicographically and values are recursively normalized.
    array (list)
        Order is preserved and elements are recursively normalized.
    scalar
        Returned unchanged.

    Notes
    -----
    Array order is intentionally preserved because JSON arrays are ordered
    semantically. Any element-wise alignment is handled later by array
    matching strategies.
    """
    t = json_type(value)
    if t == "object":
        # Sort keys for stable representation
        return {k: normalize_json(value[k]) for k in sorted(value.keys())}
    if t == "array":
        return [normalize_json(v) for v in value]
    # scalar
    return value


def parse_and_normalize_json(content: str) -> ParsedDocument:
    """
    Parse and normalize a JSON document in one step.

    Parameters
    ----------
    content : str
        Raw JSON text.

    Returns
    -------
    ParsedDocument
        Container holding both the parsed and normalized representations.

    Raises
    ------
    DocumentParseError
        If the input cannot be parsed as valid JSON.
    """
    data = parse_json(content)
    normalized = normalize_json(data)
    return ParsedDocument(data=data, normalized=normalized)
