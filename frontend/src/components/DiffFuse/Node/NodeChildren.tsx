/**
 * Render child nodes for a diff-tree node.
 *
 * Each child receives its own merged subtree value by resolving the backend-
 * provided `MergedNodeRef` against the current node's merged value.
 */

import type { DiffNode } from "../../../api/generated";
import { Node } from "./Node";
import { getChildMergedValue, type ResolvedRefByNodeId } from "../../../utils/mergedNodeRef";

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedHere: any;
    resolvedRefByNodeId: ResolvedRefByNodeId;
    sessionId: string;
    prefixParts?: boolean[]; // true = this ancestor continues with │
};

/**
 * Render the immediate children of a diff node.
 *
 * Notes
 * -----
 * Child merged values are resolved incrementally from `mergedHere`.
 * This keeps merged preview rendering aligned with backend placement rules
 * and avoids path-based lookup.
 */
export function NodeChildren({
    node,
    docIds,
    mergedHere,
    resolvedRefByNodeId,
    sessionId,
    prefixParts = [],
}: Props) {
    const children = node.children ?? [];
    if (children.length === 0) return null;

    return (
        <div style={{ display: "grid", gap: 10 }}>
            {children.map((c, i) => {
                const isLast = i === children.length - 1;
                const nextPrefixParts = [...prefixParts, !isLast];

                const childRef = resolvedRefByNodeId[c.node_id];
                
                // Resolve the child's merged subtree from the current node's merged value
                // using the backend-provided locator for that child.
                const childMergedHere = getChildMergedValue(mergedHere, childRef);

                return (
                    <Node
                        key={c.node_id}
                        node={c}
                        docIds={docIds}
                        mergedHere={childMergedHere}
                        resolvedRefByNodeId={resolvedRefByNodeId}
                        sessionId={sessionId}
                        prefixParts={nextPrefixParts}
                        isLast={isLast}
                    />
                );
            })}
        </div>
    );
}