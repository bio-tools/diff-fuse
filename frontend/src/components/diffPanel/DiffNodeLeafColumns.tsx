import React from "react";
import type { DiffNode } from "../../api/generated";
import { TextInput, TextInputLike } from "../shared/forms/TextInput";

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
                const displayValue: string = present ? (value ?? "(null)") : "(missing)";

                const isSelected = selectedDocId === docId;

                return (
                    <TextInputLike
                        key={docId}
                        name={renderValue(value)}
                        isCode={true}
                        onChangeName={(name) => onSelectDoc(node.path, name)}
                        disabled={false}
                    />
                );
            })}
            <TextInput
                name={mergedValue}
                onChangeName={(name) => onSelectDoc(node.path, name)}
                disabled={false}
            />
        </div>
    );
}