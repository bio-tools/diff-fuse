/**
 * Type helpers for merge-selection unions generated from the backend schema.
 */

import type { DocMergeSelection, ManualMergeSelection } from "../api/generated";

/**
 * Union of backend-supported merge selection shapes.
 */
export type MergeSelection = DocMergeSelection | ManualMergeSelection;

/**
 * Narrow a merge selection to the document-based variant.
 */
export function isDocSelection(sel: MergeSelection | null | undefined): sel is DocMergeSelection {
    return !!sel && sel.kind === "doc" && "doc_id" in sel;
}

/**
 * Narrow a merge selection to the manual-value variant.
 */
export function isManualSelection(sel: MergeSelection | null | undefined): sel is ManualMergeSelection {
    return !!sel && sel.kind === "manual" && "manual_value" in sel;
}
