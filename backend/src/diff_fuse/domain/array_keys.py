"""
Array key suggestion heuristics.

This module provides a heuristic to suggest candidate "identity keys" for
arrays of objects across multiple documents. It is primarily used to help a
user choose a good key for keyed array matching (e.g., matching elements by
"id", "name", "key", etc.).

The input is a mapping of `doc_id -> array`, where each array element is an
arbitrary JSON-like value (ideally a dict/object). The algorithm inspects only
object elements and scores keys based on:

- presence_ratio: how often the key appears across object elements
- unique_ratio: how unique the key's values are within each document
- scalar_ratio: how often the key's values are scalar (safe identifiers)

The output is a ranked list of `KeySuggestion` entries.

Notes
-----
- This is a heuristic, not a guarantee. It helps users pick a key that is
  likely to behave well for keyed matching.
- Only object elements are considered; scalar/array elements are ignored.
- Keys are treated as strings.
- Values are stringified for uniqueness scoring (including "null" for None).
"""

from typing import Any

from diff_fuse.models.array_keys import KeySuggestion


def _is_scalar_like(value: Any) -> bool:
    """
    Check whether a value is scalar-like in JSON terms.

    Parameters
    ----------
    value : Any
        JSON-like Python value.

    Returns
    -------
    bool
        True if value is JSON scalar-like (null/string/number/boolean).
    """
    return value is None or isinstance(value, (str, int, float, bool))


def _stringify(value: Any) -> str:
    """
    Convert a JSON-like value to a stable string representation for scoring.

    Parameters
    ----------
    value : Any
        JSON-like Python value.

    Returns
    -------
    str
        A stable string representation used for uniqueness checks and examples.
    """
    return "null" if value is None else str(value)


def _collect_object_elements(arrays_by_doc: dict[str, list[Any]]) -> list[tuple[str, dict[str, Any]]]:
    """
    Collect only object/dict elements across all documents.

    Parameters
    ----------
    arrays_by_doc : dict[str, list[Any]]
        Mapping doc_id -> list of elements.

    Returns
    -------
    list[tuple[str, dict[str, Any]]]
        List of (doc_id, element_dict) for object elements only.
    """
    out: list[tuple[str, dict[str, Any]]] = []
    for doc_id, arr in arrays_by_doc.items():
        for elem in arr:
            if isinstance(elem, dict):
                out.append((doc_id, elem))
    return out


def _candidate_keys(object_elements: list[tuple[str, dict[str, Any]]]) -> list[str]:
    """
    Compute candidate keys from object elements.

    Parameters
    ----------
    object_elements : list[tuple[str, dict[str, Any]]]
        Object elements gathered across documents.

    Returns
    -------
    list[str]
        Sorted list of candidate keys (as strings).
    """
    keys: set[str] = set()
    for _, elem in object_elements:
        keys.update(str(k) for k in elem.keys())
    return sorted(keys)


def _presence_and_examples(
    *,
    key: str,
    object_elements: list[tuple[str, dict[str, Any]]],
    max_examples: int,
) -> tuple[int, int, list[str], dict[str, list[Any]]]:
    """
    Measure raw counts for a key.

    Parameters
    ----------
    key : str
        Candidate key.
    object_elements : list[tuple[str, dict[str, Any]]]
        All object elements across docs.
    max_examples : int
        Max number of example values to collect.

    Returns
    -------
    present_count : int
        Number of object elements containing this key.
    scalar_count : int
        Number of occurrences where the key's value is scalar-like.
    examples : list[str]
        Up to max_examples example values (stringified).
    per_doc_values : dict[str, list[Any]]
        Collected values per document for uniqueness scoring.
    """
    present_count = 0
    scalar_count = 0
    examples: list[str] = []
    per_doc_values: dict[str, list[Any]] = {}

    for doc_id, elem in object_elements:
        if key not in elem:
            continue

        v = elem[key]
        present_count += 1
        if _is_scalar_like(v):
            scalar_count += 1

        per_doc_values.setdefault(doc_id, []).append(v)

        if len(examples) < max_examples:
            examples.append(_stringify(v))

    return present_count, scalar_count, examples, per_doc_values


def _uniqueness_ratio(per_doc_values: dict[str, list[Any]]) -> float:
    """
    Compute per-document uniqueness ratio averaged across documents.

    Parameters
    ----------
    per_doc_values : dict[str, list[Any]]
        Mapping doc_id -> list of values for a given key.

    Returns
    -------
    float
        Average uniqueness ratio in [0, 1]. Docs with <2 values are ignored.

    Notes
    -----
    Values are stringified before uniqueness comparison to avoid issues with
    unhashable types (though the key should ideally be scalar-like).
    """
    ratios: list[float] = []

    for _, vals in per_doc_values.items():
        if len(vals) < 2:
            continue
        svals = [_stringify(v) for v in vals]
        uniq = len(set(svals))
        ratios.append(uniq / len(svals))

    return sum(ratios) / len(ratios) if ratios else 0.0


def _score(present_ratio: float, unique_ratio: float, scalar_ratio: float) -> float:
    """
    Combine component ratios into a single score.

    Parameters
    ----------
    present_ratio : float
        Fraction of object elements where the key exists.
    unique_ratio : float
        Average per-doc uniqueness of the key values.
    scalar_ratio : float
        Fraction of occurrences with scalar-like values.

    Returns
    -------
    float
        Weighted score in [0, 1].

    Notes
    -----
    Weights are heuristic and intentionally simple.
    """
    return 0.6 * present_ratio + 0.3 * unique_ratio + 0.1 * scalar_ratio


def suggest_keys_for_array(
    arrays_by_doc: dict[str, list[Any]],
    *,
    top_k: int = 10,
    max_examples: int = 5,
) -> list[KeySuggestion]:
    """
    Suggest candidate keys for keyed matching of array elements.

    Parameters
    ----------
    arrays_by_doc : dict[str, list[Any]]
        Mapping of document id -> array value at a given path.
        Elements may be any JSON-like value; only dict elements are considered.
    top_k : int, default=10
        Maximum number of suggestions to return.
        < 0 means no limit (return all candidates).
    max_examples : int, default=5
        Maximum number of example values to attach per suggestion.

    Returns
    -------
    list[KeySuggestion]
        Ranked suggestions (highest score first). Returns an empty list if no
        object elements are found.

    Scoring details
    ---------------
    For each candidate object key, the following metrics are computed:

    - present_ratio:
        present_count / total_object_elements
    - unique_ratio:
        average over documents of (unique_values / total_values_in_doc)
        (docs with <2 values are ignored)
    - scalar_ratio:
        scalar_count / present_count

    The final score is a weighted combination:

        score = 0.6 * present_ratio + 0.3 * unique_ratio + 0.1 * scalar_ratio

    Notes
    -----
    This heuristic intentionally favors keys that appear frequently and behave
    like identifiers (unique, scalar-like).
    """
    if top_k == 0:
        return []

    object_elements = _collect_object_elements(arrays_by_doc)
    if not object_elements:
        return []

    candidates = _candidate_keys(object_elements)
    if not candidates:
        return []

    total_objects = len(object_elements)
    results: list[KeySuggestion] = []

    for k in candidates:
        present_count, scalar_count, examples, per_doc_values = _presence_and_examples(
            key=k,
            object_elements=object_elements,
            max_examples=max_examples,
        )

        # If never present, skip (shouldn't happen with candidate selection, but safe)
        if present_count == 0:
            continue

        present_ratio = present_count / total_objects
        scalar_ratio = scalar_count / present_count if present_count else 0.0
        unique_ratio = _uniqueness_ratio(per_doc_values)
        score = _score(present_ratio, unique_ratio, scalar_ratio)

        results.append(
            KeySuggestion(
                key=k,
                score=round(score, 4),
                present_ratio=round(present_ratio, 4),
                unique_ratio=round(unique_ratio, 4),
                scalar_ratio=round(scalar_ratio, 4),
                example_values=examples,
            )
        )

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_k] if top_k > 0 else results
