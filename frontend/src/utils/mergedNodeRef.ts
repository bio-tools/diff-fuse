/**
 * Resolve merged values using backend-provided merged node references.
 *
 * The frontend should not infer merged placement from display paths.
 * Instead, the backend tells us where each diff node ended up inside the merged
 * result via `MergedNodeRef`.
 */

import type { MergedNodeRef } from "../api/generated";

/**
 * Map of diff `node_id` to backend-provided merged location metadata.
 */
export type ResolvedRefByNodeId = Record<string, MergedNodeRef>;

/**
 * Resolve one child node's merged value from its parent's merged value.
 *
 * Returns `undefined` when:
 * - the child is absent from the merged output
 * - the parent merged value is missing
 * - the locator does not contain an object key or array index
 */
export function getChildMergedValue(parentMerged: any, childRef: MergedNodeRef | null | undefined): any {
    if (!childRef?.present) return undefined;
    if (parentMerged === undefined || parentMerged === null) return undefined;

    if (childRef.object_key != null) {
        return parentMerged?.[childRef.object_key];
    }

    if (childRef.array_index != null) {
        return parentMerged?.[childRef.array_index];
    }

    return undefined;
}
