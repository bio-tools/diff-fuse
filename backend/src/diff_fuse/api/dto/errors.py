"""
Standardized API error response models.

This module defines the canonical error payload returned by the HTTP API.
All application-level failures should be translated into this structure via
the global exception handlers.

Usage
-----
These models are typically not instantiated directly by route handlers.
Instead, domain/service code raises DomainError subclasses, which are then
converted into ``APIErrorResponse`` by FastAPI exception handlers.

Response shape
--------------
{
    "error": {
        "code": "...",
        "message": "...",
        "details": {...},
        "request_id": "..."
    }
}
"""

from typing import Any

from pydantic import BaseModel, Field


class APIError(BaseModel):
    """
    Machine- and human-readable description of an API failure.

    This model represents the inner error payload returned to clients.
    It is intentionally structured to support both programmatic handling
    (via ``code``) and user-facing messaging (via ``message``).

    Attributes
    ----------
    code : str
        Stable, machine-readable error identifier.
    message : str
        Human-readable summary of the error suitable for display in logs
        or UI error messages.
    details : dict[str, Any]
        Optional structured metadata providing additional diagnostic context.
        The exact structure depends on the error type.
    request_id : str | None
        Optional correlation identifier for tracing requests across systems.
    """

    code: str = Field(..., description="Stable, machine-readable error code.")
    message: str = Field(..., description="Human-readable error summary.")
    details: dict[str, Any] = Field(default_factory=dict, description="Structured error context.")
    request_id: str | None = Field(default=None, description="Optional correlation id.")


class APIErrorResponse(BaseModel):
    """
    Top-level API error envelope.

    All non-success HTTP responses produced by the application should conform
    to this structure.

    Attributes
    ----------
    error : APIError
        Detailed error information describing the failure condition.

    Notes
    -----
    Route handlers should normally not construct this model directly.
    Instead, raise domain exceptions and allow the global exception
    handlers to produce the response.
    """

    error: APIError
