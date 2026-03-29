"""
Service layer.

This package contains application-facing orchestration code
that sits between the API routes (transport) and the domain modules
(business logic).

Role in the architecture
------------------------
- Translate validated API DTOs into domain operations.
- Coordinate multiple domain components (diff + merge + export, etc.).
- Keep route handlers thin and consistent.
"""
