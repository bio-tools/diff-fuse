import { create } from 'zustand';
import type { InputDocument } from '../api/generated';
import { DocumentFormat } from '../api/generated';

export type DraftDoc = InputDocument & {
    // purely client-side
    dirty?: boolean;
};

type RawDocsState = {
    drafts: DraftDoc[];

    addDraft: () => void;
    updateDraft: (docId: string, patch: Partial<DraftDoc>) => void;
    removeDraft: (docId: string) => void;

    // helpful when session is created to keep drafts as-is
    ensureAtLeast: (n: number) => void;
};

function newDraft(i: number): DraftDoc {
    return {
        doc_id: crypto.randomUUID(),
        name: `Doc ${i}`,
        format: DocumentFormat.JSON,
        content: '',
        dirty: false,
    };
}

export const useRawDocsStore = create<RawDocsState>((set, get) => ({
    drafts: [newDraft(1), newDraft(2)],

    addDraft: () =>
        set((s) => ({ drafts: [...s.drafts, newDraft(s.drafts.length + 1)] })),

    updateDraft: (docId, patch) =>
        set((s) => ({
            drafts: s.drafts.map((d) =>
                d.doc_id === docId ? { ...d, ...patch, dirty: true } : d
            ),
        })),

    removeDraft: (docId) =>
        set((s) => ({ drafts: s.drafts.filter((d) => d.doc_id !== docId) })),

    ensureAtLeast: (n) => {
        const { drafts } = get();
        if (drafts.length >= n) return;
        const next = [...drafts];
        while (next.length < n) next.push(newDraft(next.length + 1));
        set({ drafts: next });
    },
}));