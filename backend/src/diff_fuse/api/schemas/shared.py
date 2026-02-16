"""
Shared schema helpers.

This module contains small shared building blocks that are reused across
multiple schema modules, such as:
- type aliases used in multiple endpoints
- shared request option models (e.g., diff construction options)
"""

from __future__ import annotations

from pydantic import Field

from diff_fuse.api.schemas.api import APIModel
from diff_fuse.api.schemas.array_strategies import ArrayStrategy

type ArrayStrategies = dict[str, ArrayStrategy]


class DiffOptions(APIModel):
    """
    Options that affect diff construction.

    This model is reused by endpoints that build a diff tree:
    - direct diff endpoint (documents supplied in request)
    - session-based diff endpoint (documents retrieved from session)
    - session-based merge endpoint (needs diff context for selections)

    Attributes
    ----------
    array_strategies : dict[str, ArrayStrategy]
        Mapping from array node path -> array matching strategy.
        If a path is not present, the backend uses a default strategy.
    """

    array_strategies: ArrayStrategies = Field(default_factory=dict)
