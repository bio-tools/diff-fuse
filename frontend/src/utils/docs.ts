import type { InputDocument } from '../api/generated';
import { DocumentFormat } from '../api/generated';
import type { LocalDraft } from '../hooks/docs/useLocalDrafts';

export function nonEmpty(s: string) {
    return s.trim().length > 0;
}

export function toInputDoc(d: LocalDraft): InputDocument {
    return {
        doc_id: d.doc_id,
        name: d.name || 'Untitled',
        format: DocumentFormat.JSON,
        content: d.content ?? '',
    };
}