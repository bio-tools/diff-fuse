/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayStrategyMode } from './ArrayStrategyMode';
/**
 * Per-array matching configuration.
 *
 * This model controls how a specific array path should be aligned during
 * diff computation.
 *
 * Attributes
 * ----------
 * mode : ArrayStrategyMode
 * Matching strategy to apply.
 *
 * key : str | None
 * Object field used for keyed matching (required when
 * ``mode="keyed"``).
 * Example:
 * - ``"id"``
 * - ``"name"``
 * similarity_threshold : float | None
 * Threshold used by the similarity matcher (future feature).
 * Must lie in the closed interval ``[0.0, 1.0]``.
 *
 * Notes
 * -----
 * If a strategy is invalid for the actual data (e.g., keyed mode on
 * non-object arrays), the diff engine will surface an error
 * at the corresponding array node.
 */
export type ArrayStrategy = {
    mode?: ArrayStrategyMode;
    /**
     * Object field used for keyed matching (mode=keyed).
     */
    key?: (string | null);
    /**
     * Similarity threshold in [0.0, 1.0] (mode=similarity).
     */
    similarity_threshold?: (number | null);
};

