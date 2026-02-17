/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiffRequest } from './DiffRequest';
import type { MergeSelection } from './MergeSelection';
/**
 * Request payload for computing a merged document.
 *
 * Attributes
 * ----------
 * diff_request : DiffRequest
 * Diff configuration reused during merge, primarily to supply
 * per-path array strategies.
 * Rationale:
 * Keeping this nested ensures the frontend can reuse the same
 * configuration object for both diff and merge operations.
 * selections : dict[str, MergeSelection]
 * Mapping from canonical path -> user selection.
 * Semantics:
 * - Keys must match ``DiffNode.path`` values.
 * - Each selection determines which document (or manual value)
 * is chosen at that location.
 * - Selections inherit down the subtree unless overridden.
 *
 * Notes
 * -----
 * Missing selections for conflicting nodes will result in unresolved
 * paths in the response.
 */
export type MergeRequest = {
    /**
     * Diff configuration reused during merge.
     */
    diff_request: DiffRequest;
    /**
     * Map path -> selection (doc/manual).
     */
    selections?: Record<string, MergeSelection>;
};

