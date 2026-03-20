/**
 * Utilities for indexing the diff tree by backend `node_id`.
 *
 * The diff tree is naturally hierarchical, but several UI operations are easier
 * with O(1) node lookup:
 * - walking ancestor chains
 * - checking descendant relationships
 * - resolving inherited selections
 *
 * Notes
 * -----
 * This index is derived from the latest diff response and should be treated as
 * ephemeral frontend state, not persisted backend truth.
 */

import type { DiffNode } from "../api/generated";

/**
 * Flattened metadata for one diff node.
 */
export type NodeIndexEntry = {
    nodeId: string;
    path: string;
    parentId: string | null;
    childIds: string[];
};

export type NodeIndex = Record<string, NodeIndexEntry>;

/**
 * Build a lookup table from a diff tree keyed by `node_id`.
 *
 * The resulting index supports fast parent/child traversal without repeatedly
 * walking the full tree.
 */
export function buildNodeIndex(root: DiffNode): NodeIndex {
    const out: NodeIndex = {};

    const walk = (node: DiffNode) => {
        const children = node.children ?? [];
        out[node.node_id] = {
            nodeId: node.node_id,
            path: node.path,
            parentId: node.parent_id ?? null,
            childIds: children.map((c) => c.node_id),
        };

        for (const child of children) {
            walk(child);
        }
    };

    walk(root);
    return out;
}

/**
 * Return the node id chain from `nodeId` upward to the root.
 *
 * Order is:
 * - self first
 * - then parent
 * - then grandparent
 * - ...
 */
export function ancestorNodeIds(index: NodeIndex, nodeId: string): string[] {
    const out: string[] = [];
    let cur = index[nodeId];

    while (cur) {
        out.push(cur.nodeId);
        if (!cur.parentId) break;
        cur = index[cur.parentId];
    }

    return out;
}

/**
 * Resolve the effective selection for a node using ancestor inheritance.
 *
 * The first explicit selection found while walking from `nodeId` upward wins.
 * Returns both:
 * - the node where that selection was defined
 * - the selection itself
 */
export function getEffectiveSelectionByNodeId<T>(
    selectionsByNodeId: Record<string, T>,
    index: NodeIndex,
    nodeId: string
): { atNodeId: string; sel: T } | null {
    for (const id of ancestorNodeIds(index, nodeId)) {
        const sel = selectionsByNodeId[id];
        if (sel !== undefined) {
            return { atNodeId: id, sel };
        }
    }
    return null;
}

/**
 * Check whether `candidateNodeId` is a strict descendant of `ancestorNodeId`.
 *
 * A node is not considered a descendant of itself.
 */
export function isDescendantNodeId(index: NodeIndex, candidateNodeId: string, ancestorNodeId: string): boolean {
    if (candidateNodeId === ancestorNodeId) return false;

    let cur = index[candidateNodeId];
    while (cur?.parentId) {
        if (cur.parentId === ancestorNodeId) return true;
        cur = index[cur.parentId];
    }

    return false;
}