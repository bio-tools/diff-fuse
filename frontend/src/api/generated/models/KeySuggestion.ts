/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Suggested candidate key for matching array elements.
 *
 * Each suggestion represents a heuristic evaluation of a field observed
 * across array elements. Higher scores indicate better suitability as a
 * stable identifier for keyed array alignment.
 *
 * Attributes
 * ----------
 * key : str
 * Object key name (e.g., ``"id"``, ``"name"``).
 * score : float
 * Overall heuristic score in the range ``[0, 1]``. Higher is better.
 * present_ratio : float
 * Fraction of object elements that contain this key.
 * unique_ratio : float
 * Average per-document uniqueness fraction of the key's values.
 * Higher values indicate better candidate identifier fields.
 * scalar_ratio : float
 * Fraction of occurrences where the key's value is scalar-like
 * (string/number/boolean/null).
 * example_values : list[str]
 * Small sample of observed values for this key (stringified),
 * intended for UI preview only.
 *
 * Notes
 * -----
 * - Scores are heuristic and not guarantees of correctness.
 * - The backend does not enforce that suggested keys are valid for keyed
 * array matching; validation occurs when the strategy is applied.
 */
export type KeySuggestion = {
    /**
     * Object key name (e.g., 'id', 'name').
     */
    key: string;
    /**
     * Overall heuristic score in [0, 1] (higher is better).
     */
    score: number;
    /**
     * Fraction of object elements that contain this key.
     */
    present_ratio: number;
    /**
     * Average per-document uniqueness fraction for this key's values.
     */
    unique_ratio: number;
    /**
     * Fraction of occurrences where the key's value is scalar-like.
     */
    scalar_ratio: number;
    /**
     * Example observed values for this key (stringified).
     */
    example_values: Array<string>;
};

