from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class KeySuggestion:
    key: str
    score: float
    present_ratio: float
    unique_ratio: float
    scalar_ratio: float
    example_values: list[str]


def _is_scalar(v: Any) -> bool:
    return v is None or isinstance(v, (str, int, float, bool))


def suggest_keys_for_array(arrays_by_doc: dict[str, list[Any]], top_k: int = 10) -> list[KeySuggestion]:
    """
    arrays_by_doc: doc_id -> list of elements (each element ideally dict)

    Strategy:
    - candidate keys = union of dict keys across all object elements
    - score keys by:
        presence_ratio (how often key exists across elements) +
        uniqueness_ratio (how unique values are within each doc) +
        scalar_ratio (key values are scalars)
    """
    # Collect elements
    all_elements: list[tuple[str, Any]] = []
    for doc_id, arr in arrays_by_doc.items():
        for elem in arr:
            all_elements.append((doc_id, elem))

    if not all_elements:
        return []

    # Candidate keys
    candidates: set[str] = set()
    for _, elem in all_elements:
        if isinstance(elem, dict):
            candidates.update(str(k) for k in elem.keys())

    results: list[KeySuggestion] = []

    total_elements = sum(1 for _, e in all_elements if isinstance(e, dict))
    if total_elements == 0:
        return []

    for k in sorted(candidates):
        present = 0
        scalar = 0

        # uniqueness within doc
        per_doc_values: dict[str, list[Any]] = {doc_id: [] for doc_id in arrays_by_doc.keys()}

        examples: list[str] = []
        for doc_id, elem in all_elements:
            if not isinstance(elem, dict):
                continue
            if k not in elem:
                continue
            present += 1
            v = elem[k]
            if _is_scalar(v):
                scalar += 1
            per_doc_values[doc_id].append(v)

            if len(examples) < 5:
                examples.append("null" if v is None else str(v))

        present_ratio = present / total_elements if total_elements else 0.0
        scalar_ratio = scalar / present if present else 0.0

        # Compute uniqueness ratio as average over docs (ignore docs with <2 values)
        uniq_scores: list[float] = []
        for doc_id, vals in per_doc_values.items():
            if len(vals) < 2:
                continue
            uniq = len(set(map(lambda x: "null" if x is None else str(x), vals)))
            uniq_scores.append(uniq / len(vals))
        unique_ratio = sum(uniq_scores) / len(uniq_scores) if uniq_scores else 0.0

        # Weighted score: presence, uniqueness next, scalar as a sanity check
        score = 0.6 * present_ratio + 0.3 * unique_ratio + 0.1 * scalar_ratio

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
    return results[:top_k]
