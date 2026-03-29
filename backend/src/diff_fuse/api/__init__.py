"""
API package for diff-fuse.

This package defines the HTTP interface layer of the application,
including:
- Request/response DTOs
- Route definitions
- Router composition

Notes
-----
The API layer is intentionally thin and delegates all business logic
to the service and domain layers. This separation keeps transport
concerns (FastAPI, HTTP) isolated from core diff/merge logic.
"""
