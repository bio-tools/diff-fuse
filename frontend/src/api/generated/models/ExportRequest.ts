/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MergeRequest } from './MergeRequest';
/**
 * Request payload for exporting the merged document.
 *
 * Attributes
 * ----------
 * merge_request : MergeRequest
 * Full merge configuration reused during export. This includes
 * array strategies and user selections.
 * Rationale:
 * Nesting the merge request ensures the frontend can reuse the
 * exact same state object across merge and export operations.
 * pretty : bool, default=True
 * Whether the exported text should be pretty-printed (indented).
 * If False, the output is compact.
 * require_resolved : bool, default=False
 * If True, the export will fail when unresolved conflicts remain.
 * Behavior:
 * - False -> best-effort export with unresolved paths reported.
 * - True -> export endpoint should return a conflict error when
 * unresolved paths are present.
 */
export type ExportRequest = {
    /**
     * Merge configuration reused during export.
     */
    merge_request: MergeRequest;
    pretty?: boolean;
    require_resolved?: boolean;
};

