# Diff Fuse

Diff Fuse is a tool for comparing multiple JSON documents side by side and producing a merged result interactively.

It consists of:

- a **backend** that stores comparison sessions and computes diffs, merges, array-key suggestions, and exports
- a **frontend** that lets users inspect differences, choose resolutions, adjust array matching strategies, preview the merged JSON, and export the result

## What it does

Given one or more JSON documents, Diff Fuse lets you:

- create a comparison session
- inspect structural differences in a tree view
- switch between viewing **all** nodes or only **changed** nodes
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

The comparison result is a hierarchical tree of nodes. Each node corresponds to a JSON path and has a status such as: `same`, `diff`, `missing`, `type_error`

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

## Getting started

Start the backend and frontend separately.

Start the backend: see [backend/README.md](backend/README.md).

Start the frontend: see [frontend/README.md](frontend/README.md).

### Typical workflow

1.	Open the frontend
2.	Paste one or more JSON documents
3.	Create a session
4.	Inspect the diff tree
5.	Switch between all and diff visibility
6.	Resolve conflicts by selecting source values
7.	Adjust array strategies where needed
8.	Preview the merged JSON
9.	Copy or download the result
