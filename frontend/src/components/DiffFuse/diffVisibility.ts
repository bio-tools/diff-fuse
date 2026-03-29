import { DiffStatus, type DiffNode } from "../../api/generated";

export type DiffVisibilityMode = "all" | "changed";

/**
 * Returns true when this node or anything below it should be shown in "changed" mode.
 *
 * Rule:
 * - show all nodes in "all" mode
 * - in "changed" mode, hide only fully-same subtrees
 */
export function shouldShowNode(node: DiffNode, mode: DiffVisibilityMode): boolean {
    if (mode === "all") return true;
    return subtreeHasChanges(node);
}

function subtreeHasChanges(node: DiffNode): boolean {
    if (node.status !== DiffStatus.SAME) return true;
    const children = node.children ?? [];
    return children.some(subtreeHasChanges);
}