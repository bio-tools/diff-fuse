"""
Domain-level error hierarchy.

This module defines structured exceptions raised by the domain and
service layers. These errors are later translated into API responses
by the FastAPI exception handlers.

Error handling flow
-------------------
- Domain/service code raises a DomainError subclass
- FastAPI global exception handler catches it
- Converted into APIErrorResponse
- Returned to client with appropriate HTTP status
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class DomainError(Exception):
    """
    Base class for all domain-level errors.

    Parameters
    ----------
    code : str
        Stable machine-readable error code.
    message : str
        Human-readable summary of the error.
    details : dict[str, Any] | None, default=None
        Optional structured metadata describing the failure context.

    Notes
    -----
    - Subclasses should provide fixed ``code`` values.
    - These errors are converted to API responses by the global
      FastAPI exception handlers.
    """

    code: str
    message: str
    details: dict[str, Any] | None = None

    def as_details(self) -> dict[str, Any]:
        """
        Return normalized details payload.

        Returns
        -------
        dict[str, Any]
            Never returns ``None`` — always a dictionary.
        """
        return self.details or {}


class SessionNotFoundError(DomainError):
    """
    Raised when a requested session does not exist or has expired.

    Parameters
    ----------
    session_id : str
        Identifier of the missing session.
    """

    def __init__(self, session_id: str) -> None:
        super().__init__(
            code="session_not_found",
            message="Session not found",
            details={"session_id": session_id},
        )


class DocumentParseError(DomainError):
    """
    Raised when an input document cannot be parsed as the declared format.

    Parameters
    ----------
    reason : str
        Human-readable explanation of the parsing failure.
    """

    def __init__(self, reason: str) -> None:
        super().__init__(
            code="document_parse_error",
            message="Failed to parse input document",
            details={"reason": reason},
        )


class InvalidPathError(DomainError):
    """
    Raised when a canonical document path is malformed or unsupported.

    Parameters
    ----------
    path : str
        The offending path string.
    reason : str
        Human-readable explanation of why the path is invalid.
    """

    def __init__(self, path: str, reason: str) -> None:
        super().__init__(
            code="invalid_path",
            message="Invalid path",
            details={"path": path, "reason": reason},
        )


class LimitsExceededError(DomainError):
    """
    Raised when defensive safety limits are violated.

    Examples include:
    - Too many documents in a session
    - Document size too large
    - Diff tree exceeding node limits

    Parameters
    ----------
    message : str
        Human-readable description of the violated limit.
    **details : Any
        Additional structured context about the limit breach.
    """

    def __init__(self, message: str, **details: Any) -> None:
        super().__init__(
            code="limits_exceeded",
            message=message,
            details=details,
        )


class DomainValidationError(DomainError):
    """
    Raised when input data fails domain-level validation checks.

    Parameters
    ----------
    field : str
        Name of the invalid field or parameter.
    reason : str
        Human-readable explanation of the validation failure.
    """

    def __init__(self, field: str, reason: str) -> None:
        super().__init__(
            code="domain_validation_error",
            message="Domain validation error",
            details={"field": field, "reason": reason},
        )


class ConflictUnresolvedError(DomainError):
    """
    Raised when a merge cannot complete due to unresolved conflicts.

    Parameters
    ----------
    unresolved_paths : list[str]
        Paths that still require user selection.
    """

    def __init__(self, unresolved_paths: list[str]) -> None:
        super().__init__(
            code="merge_conflict",
            message="Unresolved merge conflicts",
            details={"unresolved_paths": unresolved_paths},
        )
