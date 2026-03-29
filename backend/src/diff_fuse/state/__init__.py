"""
Session state backends and repository abstractions.

This package defines the storage layer for diff-fuse sessions. It provides:

- A repository protocol (:class:`SessionRepo`) that defines the required
  storage interface.
- A local in-memory implementation for development.
- A Redis-backed implementation for production and multi-instance deployments.

Architecture
------------
The application interacts only with the :class:`SessionRepo` protocol.
Concrete implementations can be swapped without changing service logic.
Selection of the active backend is controlled via application settings.
"""
