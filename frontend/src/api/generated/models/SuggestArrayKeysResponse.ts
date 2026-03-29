/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { KeySuggestion } from './KeySuggestion';
/**
 * Response payload containing ranked key suggestions.
 *
 * Attributes
 * ----------
 * node_id : str
 * The array node ID that was analyzed. Echoed from the request for
 * convenience and client-side validation.
 * suggestions : list[KeySuggestion]
 * Ranked list of candidate keys, ordered by descending confidence
 * score. The list may be empty if no suitable keys were detected.
 */
export type SuggestArrayKeysResponse = {
    node_id: string;
    suggestions: Array<KeySuggestion>;
};

