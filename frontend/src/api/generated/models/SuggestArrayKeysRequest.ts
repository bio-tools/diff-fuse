/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Request payload for array key suggestion.
 *
 * Attributes
 * ----------
 * path : str
 * Canonical path to the target array node (e.g., ``"steps"`` or
 * ``"a.b[0].steps"``). The path must resolve to an array in at least
 * one document.
 * top_k : int
 * Maximum number of suggestions to return.
 * Constraints:
 * - Minimum: -1 (no limit)
 * - Maximum: 50
 */
export type SuggestArrayKeysRequest = {
    /**
     * Array node path (e.g. 'steps' or 'a.b[0].steps').
     */
    path: string;
    top_k?: number;
};

