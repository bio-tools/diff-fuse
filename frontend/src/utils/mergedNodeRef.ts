import type { MergedNodeRef } from "../api/generated";

export type ResolvedRefByNodeId = Record<string, MergedNodeRef>;

export function getChildMergedValue(
    parentMerged: any,
    childRef: MergedNodeRef | null | undefined
): any {
    if (!childRef?.present) return undefined;
    if (parentMerged === undefined || parentMerged === null) return undefined;

    if (childRef.object_key != null) {
        return parentMerged?.[childRef.object_key];
    }

    if (childRef.array_index != null) {
        return parentMerged?.[childRef.array_index];
    }

    // Root may be represented as { present: true } with no locator.
    // For non-root children this should normally not happen.
    return parentMerged;
}