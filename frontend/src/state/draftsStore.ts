import { create } from 'zustand';

export type LocalDraft = {
    doc_id: string;
    name: string;
    content: string;
};

function newDraft(i: number): LocalDraft {
    return { doc_id: crypto.randomUUID(), name: `Doc ${i}`, content: '' };
}

type DraftsState = {
    drafts: LocalDraft[];
    addDraft: () => void;
    updateDraft: (docId: string, patch: Partial<Pick<LocalDraft, 'name' | 'content'>>) => void;
    removeDraft: (docId: string) => void;
    removeDrafts: (ids: string[]) => void;
    clearDrafts: () => void;
    ensureAtLeastOneDraft: () => void;
};

export const useDraftsStore = create<DraftsState>((set, get) => ({
    drafts: [],

    addDraft: () =>
        set((s) => ({ drafts: [...s.drafts, newDraft(s.drafts.length + 1)] })),

    updateDraft: (docId, patch) =>
        set((s) => ({
            drafts: s.drafts.map((d) => (d.doc_id === docId ? { ...d, ...patch } : d)),
        })),

    removeDraft: (docId) =>
        set((s) => ({ drafts: s.drafts.filter((d) => d.doc_id !== docId) })),

    removeDrafts: (ids) => {
        if (ids.length === 0) return;
        const idSet = new Set(ids);
        set((s) => ({ drafts: s.drafts.filter((d) => !idSet.has(d.doc_id)) }));
    },

    clearDrafts: () => set({ drafts: [] }),

    ensureAtLeastOneDraft: () => {
        const { drafts } = get();
        if (drafts.length === 0) {
            set({ drafts: [newDraft(1)] });
        }
    },
}));