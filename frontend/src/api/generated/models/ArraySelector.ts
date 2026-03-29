/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ArrayStrategyMode } from './ArrayStrategyMode';
/**
 * Describes how an array element was selected/aligned across documents.
 *
 * Attributes
 * ----------
 * mode : ArrayStrategyMode
 * The mode of array strategy that determined the selection/alignment of this element.
 * index : int | None
 * For index mode: the array index used for alignment.
 * key : str | None
 * For keyed mode: the key value used for alignment.
 * value : str | None
 * Optional value used for UI labeling of the aligned element.
 * Example: if mode=keyed and key="id", value might be "123" to indicate that
 * this group corresponds to elements with id=123.
 *
 * Notes
 * -----
 * This is only included for array element nodes (i.e., nodes whose parent is an array).
 * - For index mode, `index` is always present and `key` is None.
 * - For keyed mode, `key` is always present and `index` is None.
 * - For similarity mode, both `index` and `key` may be None depending on the specific alignment algorithm.
 */
export type ArraySelector = {
    mode: ArrayStrategyMode;
    index?: (number | null);
    key?: (string | null);
    value?: (string | null);
};

