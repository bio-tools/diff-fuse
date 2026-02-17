"""
Array key suggestion models.

This module defines the response model used by the array key suggestion
feature. Suggestions help the client choose a stable identifier field
for keyed array matching.
"""

from pydantic import Field

from diff_fuse.models.base import DiffFuseModel


class KeySuggestion(DiffFuseModel):
    """
    Suggested candidate key for matching array elements.

    Each suggestion represents a heuristic evaluation of a field observed
    across array elements. Higher scores indicate better suitability as a
    stable identifier for keyed array alignment.

    Attributes
    ----------
    key : str
        Object key name (e.g., ``"id"``, ``"name"``).
    score : float
        Overall heuristic score in the range ``[0, 1]``. Higher is better.
    present_ratio : float
        Fraction of object elements that contain this key.
    unique_ratio : float
        Average per-document uniqueness fraction of the key's values.
        Higher values indicate better candidate identifier fields.
    scalar_ratio : float
        Fraction of occurrences where the key's value is scalar-like
        (string/number/boolean/null).
    example_values : list[str]
        Small sample of observed values for this key (stringified),
        intended for UI preview only.

    Notes
    -----
    - Scores are heuristic and not guarantees of correctness.
    - The backend does not enforce that suggested keys are valid for keyed
      array matching; validation occurs when the strategy is applied.
    """

    key: str = Field(
        ...,
        description="Object key name (e.g., 'id', 'name').",
    )

    score: float = Field(
        ...,
        description="Overall heuristic score in [0, 1] (higher is better).",
    )

    present_ratio: float = Field(
        ...,
        description="Fraction of object elements that contain this key.",
    )

    unique_ratio: float = Field(
        ...,
        description="Average per-document uniqueness fraction for this key's values.",
    )

    scalar_ratio: float = Field(
        ...,
        description="Fraction of occurrences where the key's value is scalar-like.",
    )

    example_values: list[str] = Field(
        ...,
        description="Example observed values for this key (stringified).",
    )
