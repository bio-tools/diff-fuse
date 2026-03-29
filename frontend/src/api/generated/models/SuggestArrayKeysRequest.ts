/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request payload for array key suggestion.
 *
 * Attributes
 * ----------
 * node_id : str
 * Canonical ID of the target array node. The node ID must resolve to an array in at least
 * one document.
 * top_k : int
 * Maximum number of suggestions to return.
 * Constraints:
 * - Minimum: -1 (no limit)
 * - Maximum: 50
 */
export type SuggestArrayKeysRequest = {
    /**
     * Array node ID.
     */
    node_id: string;
    top_k?: number;
};

