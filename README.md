# Diff Fuse

Diff Fuse is a tool for comparing multiple JSON documents side by side and producing a merged result interactively.

It consists of:

- a **backend** that stores comparison sessions and computes diffs, merges, array-key suggestions, and exports
- a **frontend** that lets users inspect differences, choose resolutions, adjust array matching strategies, preview the merged JSON, and export the result

## What it does

Given one or more JSON documents, Diff Fuse lets you:

- create a comparison session
- inspect structural differences in a tree view
- filter the tree by kind of difference and by whether a row is still unresolved
- resolve conflicts by selecting values from source documents
- optionally edit merged scalar values manually
- choose array matching strategies: `index`, `keyed`, `value`
- preview the merged JSON
- copy or download the merged result

Selections propagate down the tree unless overridden more specifically at a child node.

## Repository structure

```text
.
├── backend/    # FastAPI backend
├── frontend/   # React + TypeScript + Vite frontend
└── README.md
```

## Main concepts

### Session

A session stores uploaded documents on the backend and returns a `session_id`. The frontend uses that session for all later diff/merge/export requests.

### Diff tree

The comparison result is a hierarchical tree of nodes. Each node corresponds to a JSON path and has a status: `same`, `diff`, `missing`, or `type_error`.

Only `same` means "no difference" — the other three are all kinds of difference, and the UI labels them that way (`diff`, `diff: missing`, `diff: incompatible`). They differ in whether the merge can resolve the node on its own:

- `same` and `missing` resolve automatically (there is only one real value)
- `diff` and `type_error` need you to pick a document

### Merge selection

A merge selection decides what value should appear in the merged result at a given node.

Supported selection types:

- **document selection**: choose the value from one source document
- **manual selection** *(optional)*: override with a user-provided value

Selections inherit downward unless overridden.

### Array strategy

Arrays can be aligned in different ways before comparison:

- **index**: compare by position
- **value**: compare scalar array items by value
- **keyed**: compare object elements by a key like id

## Quick start

You need Python 3.12+ with [Poetry](https://python-poetry.org/), and Node.js.

No configuration is required: the defaults already point the frontend at the backend, and the backend already allows the frontend's origin.

Run each in its own terminal.

```bash
# backend -> http://127.0.0.1:8000
cd backend
poetry install
poetry run dev
```

```bash
# frontend -> http://localhost:5173
cd frontend
npm install
npm run dev
```

Then open <http://localhost:5173>.

Sessions are held in memory by default, so they are lost whenever the backend restarts — including on auto-reload while editing backend code. Just paste your documents again.

## Getting started

For environment variables, Redis-backed sessions, production builds, tests and linting, see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

### Typical workflow

1.	Open the frontend
2.	Paste one or more JSON documents
3.	Create a session
4.	Inspect the diff tree
5.	Filter the tree by kind of difference and by resolution state (the two combine); expand or collapse all rows
6.	Resolve conflicts by selecting source values, tracking progress via the per-row checkmarks
7.	Adjust array strategies where needed
8.	Check the diagnostics panel for the reason behind any incompatible row
9.	Preview the merged JSON
10.	Copy or download the result
