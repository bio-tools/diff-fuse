"""
Core domain logic for diff-fuse.

This package contains the business logic that powers
document normalization, structural diffing, merging, array alignment,
and related utilities. This layer is intentionally independent from the
HTTP/API layer.

Error handling contract
-----------------------
Domain code should raise subclasses of
:class:`diff_fuse.domain.errors.DomainError` for expected, client-relevant
failures (e.g., invalid path, unresolved conflicts, limits exceeded).

Unexpected programmer errors should be allowed to propagate; they are
caught by the global FastAPI exception handler and surfaced as
``internal_error``.
"""
