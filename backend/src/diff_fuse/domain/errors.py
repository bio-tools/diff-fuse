from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class DomainError(Exception):
    code: str
    message: str
    details: dict[str, Any] | None = None

    def as_details(self) -> dict[str, Any]:
        return self.details or {}


class SessionNotFound(DomainError):
    def __init__(self, session_id: str) -> None:
        super().__init__(
            code="session_not_found",
            message="Session not found",
            details={"session_id": session_id},
        )


class InvalidPath(DomainError):
    def __init__(self, path: str, reason: str) -> None:
        super().__init__(
            code="invalid_path",
            message="Invalid path",
            details={"path": path, "reason": reason},
        )


class LimitsExceeded(DomainError):
    def __init__(self, message: str, **details: Any) -> None:
        super().__init__(
            code="limits_exceeded",
            message=message,
            details=details,
        )


class ConflictUnresolved(DomainError):
    def __init__(self, unresolved_paths: list[str]) -> None:
        super().__init__(
            code="merge_conflict",
            message="Unresolved merge conflicts",
            details={"unresolved_paths": unresolved_paths},
        )