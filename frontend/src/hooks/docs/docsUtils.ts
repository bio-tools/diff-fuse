import type { InputDocument } from "../../api/generated";
import { DocumentFormat } from "../../api/generated";
import type { LocalDraft } from "../../state/draftsStore";

/**
 * Return whether a draft contains non-whitespace content.
 */
export function nonEmpty(s: string) {
    return s.trim().length > 0;
}

/**
 * Convert a local draft into the backend input-document shape.
 */
export function toInputDoc(d: LocalDraft): InputDocument {
    return {
        doc_id: d.doc_id,
        name: d.name || "Untitled",
        format: DocumentFormat.JSON,
        content: d.content ?? "",
    };
}