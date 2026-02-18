import React from "react";
import type { DiffNode } from "../../api/generated";
import DiffNodeView from "./DiffNodeView";

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
};

export function DiffNodeChildren({ node, docIds, mergedRoot }: Props) {
    if (!node.children?.length) return null;

    return (
        <div style={{ display: "grid", gap: 10 }}>
            {node.children.map((c) => (
                <DiffNodeView key={c.path} node={c} docIds={docIds} mergedRoot={mergedRoot} />
            ))}
        </div>
    );
}