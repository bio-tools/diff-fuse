# Diff Fuse Backend

This is the backend for Diff Fuse, implemented as a **FastAPI** service.

It provides the comparison engine and session-based API used by the frontend.

## Core concepts

### Session
A session stores uploaded documents server-side and is identified by a `session_id`.

Subsequent operations such as diff, merge, and export operate on that session instead of resending all document contents every time.

### Diff
A diff compares the normalized documents in a session and produces a tree of nodes.

Each node has:

- a stable `node_id`
- a JSON path
- a structural kind
- a comparison status
- per-document presence/value information
- optional children

### Merge
A merge applies user selections to the diff tree and produces one merged JSON document.

Selections can be:

- document-based
- manual overrides

Selections are inherited down the tree unless overridden more specifically.

### Array strategies
The backend supports different ways to align arrays before comparing them:

- `index`
- `value`
- `keyed`

For keyed arrays, the backend can also return suggested candidate keys.

## Tech stack

- Python 3.12+
- FastAPI
- Pydantic v2
- pydantic-settings
- Uvicorn
- orjson
- Redis
- Poetry

## Getting started

### Prerequisites

- Python 3.12+
- Poetry
- Redis only if you want to use `DIFF_FUSE_SESSION_BACKEND=redis`

### Install dependencies

```bash
poetry install
```

### Environment variables

Create an `.env` file. You can use [.env.example](.env.example) as a starting point.

### Run backend in development mode

```bash
poetry run dev
```

### Run the backend in a non-reload serving mode

```bash
poetry run serve
```

### OpenAPI / API docs

When the backend is running, FastAPI docs are typically available at [http://127.0.0.1:8000/docs](127.0.0.1:8000/docs).

## Developer notes

### Formatting and linting

This backend exposes Poetry script commands for code quality (using Ruff and Black). You can run:

```bash
poetry run lint  # Lint
poetry run fmt  # Format
```

### Testing

Run tests with:

```bash
poetry run pytest
```