import React from "react";
import type { DiffNode } from "../../../api/generated";
import { Node } from "./Node";

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedRoot: any;
    sessionId: string;
    prefixParts?: boolean[]; // true = this ancestor continues with │
};


export function NodeChildren({ node, docIds, mergedRoot, sessionId, prefixParts = [] }: Props) {
    const children = node.children ?? [];
    if (children.length === 0) return null;

    return (
        <div style={{ display: "grid", gap: 10 }}>
            {children.map((c, i) => {
                const isLast = i === children.length - 1;
                const nextPrefixParts = [...prefixParts, !isLast];

                return (
                    <Node
                        key={c.path}
                        node={c}
                        docIds={docIds}
                        mergedRoot={mergedRoot}
                        sessionId={sessionId}
                        prefixParts={nextPrefixParts}
                        isLast={isLast}
                    />
                );
            })}
        </div>
    );
}