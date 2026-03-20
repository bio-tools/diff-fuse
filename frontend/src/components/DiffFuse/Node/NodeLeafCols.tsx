import React from "react";
import type { DiffNode } from "../../../api/generated";
import { TextInputButton, TextInputMatching } from "../../shared/forms/TextInput";
import styles from "./NodeLeafCols.module.css";
import { useScrollSyncX } from "../../../hooks";
import { NodeKind } from "../../../api/generated";

type Props = {
    node: DiffNode;
    docIds: string[];
    mergedValue: any;

    selectedDocId: string | null | undefined;
    selectedManualValue: any;

    onSelectDoc: (nodeId: string, docId: string) => void;
    onSelectManual: (nodeId: string, value: any) => void;

    renderValue: (v: any) => string;
};

function stringify(v: any) {
    if (v === undefined) return "";
    if (typeof v === "string") return v;
    return JSON.stringify(v, null, 2);
}

function tryParseJson(text: string): any {
    const t = text.trim();
    if (t === "") return "";
    if (t === "null") return null;
    if (t === "true") return true;
    if (t === "false") return false;
    if (!Number.isNaN(Number(t)) && t.match(/^-?\d+(\.\d+)?$/)) return Number(t);

    try {
        return JSON.parse(t);
    } catch {
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
    const leafRef = useScrollSyncX(`leaf:${node.node_id}`);

    const selectionKind =
        selectedManualValue !== undefined ? "manual" : selectedDocId ? "doc" : "none";

    const mergedShown = selectionKind === "manual" ? selectedManualValue : mergedValue;

    const [draft, setDraft] = React.useState<string>(stringify(mergedShown));

    // whenever the “shown” value changes from outside, reset draft
    React.useEffect(() => {
        setDraft(stringify(mergedShown));
    }, [mergedShown]);

    const commit = React.useCallback(() => {
        onSelectManual(node.node_id, tryParseJson(draft));
    }, [draft, node.node_id, onSelectManual]);

    const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            // Ctrl/Cmd+Enter commits (so Enter alone can still add newlines if you want later)
            e.preventDefault();
            commit();
            e.currentTarget.blur();
        } else if (e.key === "Escape") {
            e.preventDefault();
            setDraft(stringify(mergedShown));
            e.currentTarget.blur();
        }
    };

    return (
        <div className={styles.row}>
            <div className="docStrip noScrollbar" ref={leafRef}>
                <div className="docStripInner">
                    {docIds.map((docId) => {
                        const pd = node.per_doc?.[docId];
                        const present = !!pd?.present;

                        let label: string;
                        if (!present) {
                            label = "missing";
                        } else if (node.kind !== NodeKind.SCALAR) {
                            label = node.kind === NodeKind.OBJECT ? "{…}" : "[…]";
                        } else {
                            label = renderValue(pd?.value);
                        }

                        const isSelected = selectedDocId === docId && selectionKind !== "manual";

                        return (
                            <div key={docId} className="docCol">
                                <TextInputButton
                                    name={label}
                                    onClick={() => onSelectDoc(node.node_id, docId)}
                                    disabled={false}
                                    selected={isSelected}
                                    isCode={true}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.mergedSticky}>
                {node.kind !== NodeKind.OBJECT && node.kind !== NodeKind.ARRAY && (
                    <TextInputMatching
                        name={draft}
                        onChangeName={(next) => setDraft(next)}
                        onBlur={commit}
                        onKeyDown={onKeyDown}
                        disabled={false}
                        isCode={true}
                    />
                )}
            </div>
        </div>
    );
}