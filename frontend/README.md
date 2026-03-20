# Diff Fuse Frontend

This is the frontend for Diff Fuse, built with **React**, **TypeScript**, and **Vite**.

It provides the interactive UI for:

- entering JSON documents
- creating and continuing comparison sessions
- visualizing the diff tree
- choosing merge resolutions
- adjusting array matching strategies
- previewing the merged JSON
- copying or downloading the merged result

## Tech stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Sonner
- Lucide React
- Floating UI
- Biome

## Important concepts in the frontend

### Route-driven session state

The active session is derived from the URL:

-	`/` - no active session yet
-	`/s/:sessionId` - active backend session

The route is treated as the source of truth.

### Server state vs local UI state

The app deliberately separates:

-	**server state**: sessions, diff results, merge results, export results
-	**local UI state**: drafts, local array strategies, local merge selections, visibility mode, modal state

### Scroll synchronization

Horizontal document strips are synchronized so side-by-side columns stay aligned while scrolling.

## Getting started

### Prerequisites

-	Node.js
-	your preferred package manager. In this example, we use npm
-	a running Diff Fuse backend

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file. See [.env.examle](.env.example).

Current frontend env vars:

- `VITE_API_BASE_URL`: Base URL of the backend API.
- `VITE_ENABLE_MERGE_EDITING`: Controls whether manual editing of merged values is enabled.

### Run the development server

```bash
npm run dev  # build and preview for deployment
```

## Developer notes

### Formatting and linting

This project uses Biome. You can run

```bash
npm run check  # Check formatting and lint issues
npm run check:fix  # Apply safe fixes
npm run format  # Format files
npm run typecheck  # Typecheck
```

### API client generation

The frontend contains generated API types and service code under `src/api/generated/`.

These files are generated from the backend OpenAPI schema and should not be edited manually.

If the backend API changes, regenerate the client instead of patching generated files by hand.
You can do so by starting up backend and running

```bash
npm run api:gen
```