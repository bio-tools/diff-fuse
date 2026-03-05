import React from "react";
import type { DiffNode } from "../../../api/generated";
import { Node } from "./Node";

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
    sessionId: string;
};

export function NodeChildren({ node, docIds, mergedRoot, sessionId }: Props & { sessionId: string }) {
    if (!node.children?.length) return null;

    return (
        <div style={{ display: "grid", gap: 10 }}>
            {node.children.map((c) => (
                <Node key={c.path} node={c} docIds={docIds} mergedRoot={mergedRoot} sessionId={sessionId} />
            ))}
        </div>
    );
}