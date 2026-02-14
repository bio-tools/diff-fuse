from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal

import orjson

JsonType = Literal["object", "array", "string", "number", "boolean", "null"]


class DocumentParseError(ValueError):
    """Raised when an input document cannot be parsed as the declared format."""


@dataclass(frozen=True)
class ParsedDocument:
    """
    Parsed + normalized representation of a document.
    - `data` is plain Python (dict/list/str/int/float/bool/None).
    - `normalized` is a deep-normalized version where dict keys are sorted recursively.
      (Lists are kept in their original order.)
    """

    data: Any
    normalized: Any


def parse_json(content: str) -> Any:
    """
    Strict JSON parse.
    - Accepts any valid JSON value (object/array/scalar).
    - Raises DocumentParseError with a readable message on failure.
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
    Return a normalized JSON type label for a Python value.
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
    Canonicalize JSON-ish Python structures:
    - dict: sort keys (recursively normalize values)
    - list: preserve order (recursively normalize items)
    - scalars: returned as-is
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
    Parse and normalize JSON document in one step.
    """
    data = parse_json(content)
    normalized = normalize_json(data)
    return ParsedDocument(data=data, normalized=normalized)
