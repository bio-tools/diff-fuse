import type {
    DocMergeSelection,
    ManualMergeSelection,
} from "../api/generated";

export type MergeSelection = DocMergeSelection | ManualMergeSelection;

export function isDocSelection(
    sel: MergeSelection | null | undefined
): sel is DocMergeSelection {
    return !!sel && sel.kind === "doc" && "doc_id" in sel;
}

export function isManualSelection(
    sel: MergeSelection | null | undefined
): sel is ManualMergeSelection {
    return !!sel && sel.kind === "manual" && "manual_value" in sel;
}