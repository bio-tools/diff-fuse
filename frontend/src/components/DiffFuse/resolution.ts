import type { DiffNode } from "../../api/generated";

/**
 * How settled a row is.
 *
 * - "chosen": you picked a value here, or inherited one from an ancestor you picked
 * - "auto": settled without you, because only one real value existed
 * - "unresolved": still needs a decision before it can enter the merged output
 */
export type ResolutionState = "chosen" | "auto" | "unresolved";

export type ResolutionByNodeId = Record<string, ResolutionState>;

/** Second, independent filter dimension, combined with the kind filter. */
export type ResolutionFilter = "all" | "resolved" | "unresolved";

export const RESOLUTION_FILTER_OPTIONS: { value: ResolutionFilter; label: string }[] = [
    { value: "all", label: "Any state" },
    { value: "resolved", label: "Resolved" },
    { value: "unresolved", label: "Needs a decision" },
];

/**
 * Classify every node in the tree.
 *
 * Selections inherit downward, so a pick at an ancestor makes its whole subtree
 * "chosen". Containers then aggregate upward with `unresolved` beating `chosen`
 * beating `auto` -- so a parent is only ever marked settled when everything
 * beneath it is.
 *
 * `unresolvedNodeIds` comes from the merge response and is authoritative for
 * which rows still need a decision.
 */
export function buildResolutionStates(
    root: DiffNode | undefined,
    unresolvedNodeIds: readonly string[],
    hasSelection: (nodeId: string) => boolean
): ResolutionByNodeId {
    const out: ResolutionByNodeId = {};
    if (!root) return out;

    const unresolved = new Set(unresolvedNodeIds);

    const walk = (node: DiffNode, inheritedSelection: boolean): ResolutionState => {
        const selectedHere = inheritedSelection || hasSelection(node.node_id);

        // Always walk children so every node lands in the map.
        const childStates = (node.children ?? []).map((child) => walk(child, selectedHere));

        let state: ResolutionState;
        if (unresolved.has(node.node_id) || childStates.includes("unresolved")) {
            state = "unresolved";
        } else if (selectedHere || childStates.includes("chosen")) {
            state = "chosen";
        } else {
            state = "auto";
        }

        out[node.node_id] = state;
        return state;
    };

    walk(root, false);
    return out;
}

export function matchesResolutionFilter(state: ResolutionState, filter: ResolutionFilter): boolean {
    if (filter === "all") return true;
    if (filter === "unresolved") return state === "unresolved";
    return state !== "unresolved";
}
