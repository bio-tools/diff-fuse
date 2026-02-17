from pydantic import Field

from diff_fuse.models.api import APIModel


class KeySuggestion(APIModel):
    """
    Suggested candidate key for matching array elements.

    Attributes
    ----------
    key : str
        Object key name (e.g., "id", "name").
    score : float
        Overall score in [0, 1] (heuristic; higher is better).
    present_ratio : float
        Fraction of object elements that contain this key.
    unique_ratio : float
        Average per-document uniqueness fraction for this key's values.
    scalar_ratio : float
        Fraction of occurrences where the key's value is scalar-like.
    example_values : list[str]
        A few example values observed for this key (stringified).
    """

    key: str = Field(..., description="Object key name (e.g., 'id', 'name').")
    score: float = Field(..., description="Overall score in [0, 1] (heuristic; higher is better).")
    present_ratio: float = Field(..., description="Fraction of object elements that contain this key.")
    unique_ratio: float = Field(..., description="Average per-document uniqueness fraction for this key's values.")
    scalar_ratio: float = Field(..., description="Fraction of occurrences where the key's value is scalar-like.")
    example_values: list[str] = Field(..., description="A few example values observed for this key (stringified).")
