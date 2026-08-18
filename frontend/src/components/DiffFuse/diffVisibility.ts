import { type DiffNode, DiffStatus } from "../../api/generated";
import { matchesResolutionFilter, type ResolutionByNodeId, type ResolutionFilter } from "./resolution";
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

/**
 * The two filter dimensions, plus the per-node resolution states they need.
 *
 * Kind and resolution are independent and combine with AND, so you can narrow to
 * one kind of difference that still needs a decision.
 */
export type TreeView = {
    kind: DiffVisibilityMode;
    resolution: ResolutionFilter;
    resolutionByNodeId: ResolutionByNodeId;
};

function matchesKind(node: DiffNode, mode: DiffVisibilityMode): boolean {
    if (mode === "all") return true;
    if (mode === "changed") return node.status !== DiffStatus.SAME;
    return node.status === mode;
}

function nodeMatches(node: DiffNode, view: TreeView): boolean {
    if (!matchesKind(node, view.kind)) return false;
    const state = view.resolutionByNodeId[node.node_id] ?? "auto";
    return matchesResolutionFilter(state, view.resolution);
}

/**
 * Returns true when this node or anything below it should be shown.
 *
 * A node is kept when it matches the filters itself, or when a descendant does --
 * otherwise the matching descendant would be unreachable.
 */
export function shouldShowNode(node: DiffNode, view: TreeView): boolean {
    if (view.kind === "all" && view.resolution === "all") return true;
    return subtreeMatches(node, view);
}

function subtreeMatches(node: DiffNode, view: TreeView): boolean {
    if (nodeMatches(node, view)) return true;
    return (node.children ?? []).some((child) => subtreeMatches(child, view));
}
