import React from "react";
import type { DiffNode } from "../../../api/generated";
import { TextInput, TextInputLike, TextInputButton, TextInputMatching } from "../../shared/forms/TextInput";
import styles from './NodeLeafCols.module.css';

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedValue: any;

    selectedDocId: string | null | undefined;
    selectedManualValue: any;

    onSelectDoc: (path: string, docId: string) => void;
    onSelectManual: (path: string, value: any) => void;

    renderValue: (v: any) => string;
};

function stringify(v: any) {
    if (v === undefined) return "";
    if (typeof v === "string") return v;
    return JSON.stringify(v, null, 2);
}

function tryParseJson(text: string): any {
    // allow simple scalars too
    const t = text.trim();
    if (t === "") return undefined;
    if (t === "null") return null;
    if (t === "true") return true;
    if (t === "false") return false;
    if (!Number.isNaN(Number(t)) && t.match(/^-?\d+(\.\d+)?$/)) return Number(t);

    // object/array/string
    try {
        return JSON.parse(t);
    } catch {
        // fallback: treat as raw string (so user can type without perfect JSON)
        return text;
    }
}


export function NodeLeafCols({
    node,
    docIds,
    mergedValue,
    selectedDocId,
    selectedManualValue,
    onSelectDoc,
    onSelectManual,
    renderValue,
}: Props) {
    const selectionKind =
        selectedManualValue !== undefined ? "manual" : selectedDocId ? "doc" : "none";

    const mergedShown =
        selectionKind === "manual" ? selectedManualValue : mergedValue;

    const [draft, setDraft] = React.useState<string>(stringify(mergedShown));

    React.useEffect(() => {
        setDraft(stringify(mergedShown));
    }, [mergedShown]);

    return (
        <div
            className={styles.grid}
            // style={{
            //     gridTemplateColumns: `repeat(${docIds.length + 1}, 1fr)`,
            // }}
        >
            {docIds.map((docId) => {
                const pd = node.per_doc?.[docId];
                const present = pd?.present;
                const value = present ? pd?.value : undefined;

                const isSelected = selectedDocId === docId && selectionKind !== "manual";

                return (
                    <TextInputButton
                        name={renderValue(value)}
                        key={docId}
                        onClick={() => onSelectDoc(node.path, docId)}
                        disabled={false}
                        selected={isSelected}
                        isCode={true}
                    />
                );
            })}

            <TextInputMatching
                name={draft}
                onChangeName={(next) => {
                    setDraft(next);
                    onSelectManual(node.path, tryParseJson(next));
                }}
                disabled={false}
                isCode={true}
            />
        </div>
    );
}
