/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Machine-readable locator for a diff node inside the merged output.
 *
 * This model tells how to resolve a node's merged value from its
 * parent's merged value.
 *
 * Attributes
 * ----------
 * present : bool
 * Whether this node is present in the merged output.
 * object_key : str | None
 * If present=True and this node is under an object, the key to access it.
 * array_index : int | None
 * If present=True and this node is under an array, the index to access it.
 *
 * Semantics
 * ---------
 * present = False
 * The node does not exist in the merged output.
 * present = True and object_key is not None
 * The node is available at parent_merged[object_key].
 * present = True and array_index is not None
 * The node is available at parent_merged[array_index].
 *
 * Notes
 * -----
 * - For non-root nodes, exactly one of `object_key` or `array_index` should
 * be set when `present=True`.
 * - The root node may be represented with only `present=True`.
 */
export type MergedNodeRef = {
    /**
     * Whether this node exists in the merged output.
     */
    present: boolean;
    /**
     * Key under the parent merged object, when applicable.
     */
    object_key?: (string | null);
    /**
     * Index under the parent merged array, when applicable.
     */
    array_index?: (number | null);
};

