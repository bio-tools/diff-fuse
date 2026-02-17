import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from diff_fuse.api.dto.errors import APIError, APIErrorResponse
from diff_fuse.api.router import api_router
from diff_fuse.domain.errors import DomainError
from diff_fuse.settings import get_settings

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

def _get_request_id(request: Request) -> str:
    rid = request.headers.get("x-request-id")
    return rid or uuid.uuid4().hex


@app.exception_handler(DomainError)
async def handle_domain_error(request: Request, exc: DomainError):
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

app.include_router(api_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.environment}
