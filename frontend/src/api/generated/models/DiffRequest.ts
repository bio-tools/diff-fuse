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
 * array_strategies : dict[str, ArrayStrategy]
 * Optional per-path overrides controlling how arrays are matched.
 * Keys are canonical array paths (e.g., ``"steps"`` or
 * ``"pipeline.tasks"``).
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
    array_strategies?: Record<string, ArrayStrategy>;
};

