"""
diff-fuse backend package.

This is the Python package for the diff-fuse backend service.
It implements an API and supporting domain logic for:

- N-way structured document diffing
- Interactive, path-level merge selection
- Array alignment strategies
- Export of merged results
- Session-based workflows for efficient UI interaction

Package architecture
--------------------
The codebase follows a layered structure:

API layer (``diff_fuse.api``)
    FastAPI routes, DTOs, and transport concerns.

Service layer (``diff_fuse.services``)
    Application orchestration and session-aware workflows.

Domain layer (``diff_fuse.domain``)
    Pure business logic for diffing, merging, normalization, and analysis.

State layer (``diff_fuse.state``)
    Session persistence abstractions (memory or Redis).

Models (``diff_fuse.models``)
    Shared typed data structures used across layers.

Configuration (``diff_fuse.settings``)
    Environment-driven runtime configuration.

Notes
-----
The FastAPI application entrypoint is defined in :mod:`diff_fuse.main`.
"""
