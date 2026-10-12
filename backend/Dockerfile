# ---- build: resolve dependencies from the lock file into a venv ----
FROM python:3.12-slim AS build

ENV PIP_NO_CACHE_DIR=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1

WORKDIR /app
RUN pip install "poetry>=2,<3"

# Dependencies first, so source edits do not invalidate this layer.
COPY pyproject.toml poetry.lock README.md ./
RUN poetry install --only main --no-root

COPY src ./src
RUN poetry install --only main

# ---- runtime: venv and source only, no Poetry ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    DIFF_FUSE_HOST=0.0.0.0 \
    DIFF_FUSE_PORT=8000 \
    DIFF_FUSE_RELOAD=false

WORKDIR /app
RUN useradd --system --uid 10001 app
COPY --from=build /app/.venv ./.venv
COPY --from=build /app/src ./src

USER app
EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"

CMD ["serve"]
