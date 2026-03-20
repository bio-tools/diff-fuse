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