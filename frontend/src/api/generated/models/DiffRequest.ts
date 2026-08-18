/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayStrategy } from './ArrayStrategy';
import type { NullMode } from './NullMode';
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
 * null_mode : NullMode
 * How JSON null is interpreted when comparing documents. Defaults to
 * `NullMode.missing`, where a null means "no value" just like an absent key.
 * Use `NullMode.value` to treat null as an ordinary value whose type can
 * conflict with others.
 *
 * Notes
 * -----
 * This request does **not** include documents; documents are retrieved
 * from the session identified in the route.
 *
 * `null_mode` should be sent consistently to the diff, merge and export
 * endpoints: each rebuilds the tree from the request, and changing the mode
 * changes which nodes exist, so selections keyed by node id may no longer match.
 */
export type DiffRequest = {
    array_strategies_by_node_id?: Record<string, ArrayStrategy>;
    /**
     * How JSON null is interpreted. 'missing' treats null as no value.
     */
    null_mode?: NullMode;
};

