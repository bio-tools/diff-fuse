/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayStrategy } from './ArrayStrategy';
/**
 * Request payload for computing a diff within a session.
 *
 * Attributes
 * ----------
 * array_strategies_by_node_id : dict[str, ArrayStrategy]
 * Optional per-node overrides controlling how arrays are matched.
 * Keys are canonical node IDs.
 * Behavior:
 * - Missing paths use the backend default strategy.
 * - Provided paths override the strategy only at that location.
 *
 * Notes
 * -----
 * This request does **not** include documents; documents are retrieved
 * from the session identified in the route.
 */
export type DiffRequest = {
    array_strategies_by_node_id?: Record<string, ArrayStrategy>;
};

