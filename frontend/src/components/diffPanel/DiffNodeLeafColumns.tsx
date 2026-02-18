import React from "react";
import type { DiffNode } from "../../api/generated";

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedValue: any;
    selectedDocId: string | null | undefined;
    onSelectDoc: (path: string, docId: string) => void;
    renderValue: (v: any) => React.ReactNode;
};

export function DiffNodeLeafColumns({
    node,
    docIds,
    mergedValue,
    selectedDocId,
    onSelectDoc,
    renderValue,
}: Props) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${docIds.length + 1}, 1fr)`,
                gap: 12,
            }}
        >
            {docIds.map((docId) => {
                const pd = node.per_doc?.[docId];
                const present = pd?.present;
                const value = present ? pd?.value : undefined;

                const isSelected = selectedDocId === docId;

                return (
                    <div
                        key={docId}
                        onClick={() => onSelectDoc(node.path, docId)}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            padding: 10,
                            cursor: "pointer",
                            outline: isSelected ? "2px solid #333" : "none",
                        }}
                    >
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{docId}</div>
                        {!present ? <span style={{ opacity: 0.6 }}>(missing)</span> : renderValue(value)}
                    </div>
                );
            })}

            <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>merged</div>
                {renderValue(mergedValue)}
            </div>
        </div>
    );
}