/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MergedNodeRef } from './MergedNodeRef';
/**
 * Response payload containing the merged output.
 *
 * Attributes
 * ----------
 * merged : Any
 * The merged JSON-like structure produced after applying
 * selections. The structure matches the input document shape.
 * unresolved_node_ids : list[str]
 * Canonical node IDs that could not be resolved due to missing
 * selections.
 * resolved_ref_by_node_id : dict[str, MergedNodeRef]
 * Machine-readable mapping describing where each diff node ended up
 * in the merged output. This allows the frontend to render merged
 * previews without relying on display paths.
 *
 * Notes
 * -----
 * The backend performs a best-effort merge even when unresolved
 * conflicts remain.
 */
export type MergeResponse = {
    merged: any;
    unresolved_node_ids?: Array<string>;
    resolved_ref_by_node_id?: Record<string, MergedNodeRef>;
};

