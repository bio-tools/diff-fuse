"""
Shared (API) base model.

This module defines the common Pydantic base class used by all request and
response schemas in the API and all the domain models.
The goal is to centralize validation behavior
and enforce a strict, predictable contract between clients and the server.

By default, the base model forbids unknown fields in incoming payloads.
This prevents silent acceptance of misspelled or deprecated fields and
helps maintain long-term API stability.

Usage
-----
All public API schemas should inherit from `DiffFuseModel` instead of directly
from `pydantic.BaseModel`:

    class MyRequest(DiffFuseModel):
        ...
"""

from pydantic import BaseModel, ConfigDict


class DiffFuseModel(BaseModel):
    """
    Base schema model for all API payloads and the models.

    This model centralizes shared Pydantic configuration for schemas.
    In particular, it enforces strict input validation
    by rejecting unknown fields.

    Configuration
    -------------
    extra = "forbid"
        Any unexpected fields in incoming payloads will raise a validation
        error instead of being silently ignored.

    Notes
    -----
    All public API schemas should inherit from this base class unless
    there is a deliberate reason to allow extra fields.
    """

    model_config = ConfigDict(extra="forbid")
