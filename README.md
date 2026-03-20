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