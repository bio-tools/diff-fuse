/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response payload containing the merged output.
 *
 * Attributes
 * ----------
 * merged : Any
 * The merged JSON-like structure produced after applying
 * selections. The structure matches the input document shape.
 * unresolved_paths : list[str]
 * Canonical paths that could not be resolved due to missing
 * selections.
 * Behavior:
 * - Empty list -> merge fully resolved.
 * - Non-empty -> client should prompt the user for decisions.
 *
 * Notes
 * -----
 * The backend performs a best-effort merge even when unresolved
 * conflicts remain.
 */
export type MergeResponse = {
    merged: any;
    unresolved_paths?: Array<string>;
};

