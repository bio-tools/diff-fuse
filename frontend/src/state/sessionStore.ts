import { create } from 'zustand';
import type { DocumentMeta } from '../api/generated';

type SessionState = {
    sessionId: string | null;
    documentsMeta: DocumentMeta[];
    setSession: (sessionId: string, documentsMeta: DocumentMeta[]) => void;
    clearSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
    sessionId: null,
    documentsMeta: [],
    setSession: (sessionId, documentsMeta) => set({ sessionId, documentsMeta }),
    clearSession: () => set({ sessionId: null, documentsMeta: [] }),
}));