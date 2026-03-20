/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Array element matching strategy.
 *
 * Attributes
 * ----------
 * index : str
 * Match elements by positional index.
 * Example:
 * ``arr[0]`` aligns across all documents.
 * value : str
 * Match elements by value.
 * Requirements:
 * - Elements must be JSON scalars (string/number/boolean/null).
 * - Values should be unique (per document) to avoid ambiguity.
 * keyed : str
 * Match elements by a key field inside each object element.
 * Requirements:
 * - Elements must be JSON objects.
 * - The configured key must exist in each element.
 * - Key values should be unique (per document).
 * similarity : str
 * Match elements using a similarity heuristic (planned feature).
 */
export enum ArrayStrategyMode {
    INDEX = 'index',
    VALUE = 'value',
    KEYED = 'keyed',
    SIMILARITY = 'similarity',
}
