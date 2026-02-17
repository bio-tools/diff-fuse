"""
FastAPI application entrypoint for diff-fuse.

This module constructs the ASGI app, wires up global middleware, and installs
exception handlers that convert internal errors into a stable API error shape.

Key responsibilities
--------------------
- Create the :class:`fastapi.FastAPI` application.
- Configure CORS for browser-based clients.
- Install global exception handlers:
  - Domain errors raised by the service/domain layers.
  - Request validation errors raised by FastAPI/Pydantic.
  - Unexpected errors (failsafe).
- Expose lightweight health endpoint for deployments.

Error handling contract
-----------------------
All handled errors are converted into :class:`diff_fuse.api.dto.errors.APIErrorResponse`
to keep client-side error parsing consistent. A correlation id (``request_id``)
is attached to each error response:
- If the client provides ``X-Request-Id``, it is reused.
- Otherwise, a new UUID hex string is generated.
"""

import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from diff_fuse.api.dto.errors import APIError, APIErrorResponse
from diff_fuse.api.router import router
from diff_fuse.deps import get_session_repo
from diff_fuse.domain.errors import DomainError
from diff_fuse.settings import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle hook.

    Startup
    -------
    - Resolve the configured SessionRepo to validate settings.
    - Optionally "touch" Redis to fail fast if unavailable.
    """
    # Validate session backend selection early
    repo = get_session_repo()

    # Optional: if Redis repo, ping it once to fail fast
    # Keep it defensive: don't crash dev if Redis not configured.
    try:
        if hasattr(repo, "_r"):  # RedisSessionRepo internal
            repo._r.ping()
    except Exception as e:
        # In prod, fail fast if Redis is required but unreachable
        if settings.environment == "prod":
            raise RuntimeError("Redis session backend is configured but Redis is unreachable.") from e

    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)


def _get_request_id(request: Request) -> str:
    """
    Get a correlation id for the current request.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request object.

    Returns
    -------
    str
        Correlation id to include in error responses. If the request includes an
        ``X-Request-Id`` header, it is reused. Otherwise a new UUID is generated.
    """
    rid = request.headers.get("x-request-id")
    return rid or uuid.uuid4().hex


@app.exception_handler(DomainError)
async def handle_domain_error(request: Request, exc: DomainError):
    """
    Convert a domain-level error into a consistent API error response.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request.
    exc : diff_fuse.domain.errors.DomainError
        Raised error containing a stable error code and structured details.

    Returns
    -------
    fastapi.responses.JSONResponse
        Error response with the standard :class:`APIErrorResponse` payload.
    """
    rid = _get_request_id(request)
    payload = APIErrorResponse(
        error=APIError(
            code=exc.code,
            message=exc.message,
            details=exc.as_details(),
            request_id=rid,
        )
    )

    # Map code -> status (simple and explicit)
    status = 400
    if exc.code == "session_not_found":
        status = 404
    elif exc.code in {"merge_conflict"}:
        status = 409
    elif exc.code in {"limits_exceeded"}:
        status = 413

    return JSONResponse(status_code=status, content=payload.model_dump())


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError):
    """
    Convert request validation errors into a consistent API error response.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request.
    exc : fastapi.exceptions.RequestValidationError
        Validation error raised during request parsing/validation.

    Returns
    -------
    fastapi.responses.JSONResponse
        Error response with code ``validation_error`` and structured details.
    """
    rid = _get_request_id(request)
    payload = APIErrorResponse(
        error=APIError(
            code="validation_error",
            message="Request validation failed",
            details={"errors": exc.errors()},
            request_id=rid,
        )
    )
    return JSONResponse(status_code=422, content=payload.model_dump())


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception):
    """
    Convert unexpected errors into a generic API error response.

    Parameters
    ----------
    request : fastapi.Request
        Incoming request.
    exc : Exception
        Unhandled exception.

    Returns
    -------
    fastapi.responses.JSONResponse
        Error response with code ``internal_error``.

    Notes
    -----
    This is a safety net.
    """
    rid = _get_request_id(request)
    payload = APIErrorResponse(
        error=APIError(
            code="internal_error",
            message="Internal server error",
            details={},
            request_id=rid,
        )
    )
    return JSONResponse(status_code=500, content=payload.model_dump())


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health() -> dict[str, str]:
    """
    Health check endpoint.

    Returns
    -------
    dict[str, str]
        Minimal health payload. Intended for load balancers and orchestration checks.
    """
    return {"status": "ok", "env": settings.environment}
