import { create } from 'zustand';
import type { DocumentMeta } from '../api/generated';

type SessionState = {
    sessionId: string | null;
    documentsMeta: DocumentMeta[];

    // Set both (used after createSession / docsMeta fetch)
    setSession: (sessionId: string, documentsMeta: DocumentMeta[]) => void;

    // Update only docs list (used after addDocs/removeDoc, or after docsMeta refetch)
    setDocumentsMeta: (documentsMeta: DocumentMeta[]) => void;

    // Convenience helpers
    addDocumentsMeta: (docs: DocumentMeta[]) => void;
    removeDocumentMetaById: (docId: string) => void;

    clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
    sessionId: null,
    documentsMeta: [],

    setSession: (sessionId, documentsMeta) =>
        set({ sessionId, documentsMeta }),

    setDocumentsMeta: (documentsMeta) =>
        set({ documentsMeta }),

    addDocumentsMeta: (docs) =>
        set((s) => ({ documentsMeta: [...s.documentsMeta, ...docs] })),

    removeDocumentMetaById: (docId) =>
        set((s) => ({ documentsMeta: s.documentsMeta.filter((d) => d.doc_id !== docId) })),

    clearSession: () =>
        set({ sessionId: null, documentsMeta: [] }),
}));