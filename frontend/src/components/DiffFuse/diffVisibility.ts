import { type DiffNode, DiffStatus } from "../../api/generated";
import { statusLabel } from "./statusLabels";

/**
 * What the tree is filtered down to.
 *
 * - "all": every node
 * - "changed": anything that is not `same`
 * - a `DiffStatus`: only that kind of difference
 */
export type DiffVisibilityMode = "all" | "changed" | DiffStatus;

export type DiffVisibilityOption = {
    value: DiffVisibilityMode;
    label: string;
};

/** Menu entries, broadest filter first. */
export const DIFF_VISIBILITY_OPTIONS: DiffVisibilityOption[] = [
    { value: "all", label: "Show everything" },
    { value: "changed", label: "All differences" },
    { value: DiffStatus.DIFF, label: `Only ${statusLabel(DiffStatus.DIFF)}` },
    { value: DiffStatus.MISSING, label: `Only ${statusLabel(DiffStatus.MISSING)}` },
    { value: DiffStatus.TYPE_ERROR, label: `Only ${statusLabel(DiffStatus.TYPE_ERROR)}` },
];

function matches(node: DiffNode, mode: DiffVisibilityMode): boolean {
    if (mode === "changed") return node.status !== DiffStatus.SAME;
    return node.status === mode;
}

/**
 * Returns true when this node or anything below it should be shown.
 *
 * A node is kept when it matches the filter itself, or when a descendant does --
 * otherwise the matching descendant would be unreachable.
 */
export function shouldShowNode(node: DiffNode, mode: DiffVisibilityMode): boolean {
    if (mode === "all") return true;
    return subtreeMatches(node, mode);
}

function subtreeMatches(node: DiffNode, mode: DiffVisibilityMode): boolean {
    if (matches(node, mode)) return true;
    return (node.children ?? []).some((child) => subtreeMatches(child, mode));
}
