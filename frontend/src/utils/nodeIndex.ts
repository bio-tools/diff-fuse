import type { DiffNode } from "../api/generated";

export type NodeIndexEntry = {
    nodeId: string;
    path: string;
    parentId: string | null;
    childIds: string[];
};

export type NodeIndex = Record<string, NodeIndexEntry>;

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

export function isDescendantNodeId(index: NodeIndex, candidateNodeId: string, ancestorNodeId: string): boolean {
    if (candidateNodeId === ancestorNodeId) return false;

    let cur = index[candidateNodeId];
    while (cur?.parentId) {
        if (cur.parentId === ancestorNodeId) return true;
        cur = index[cur.parentId];
    }

    return false;
}