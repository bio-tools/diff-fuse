import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArrayStrategy, MergeSelection } from '../api/generated';
import { MergeSelection as MergeSelectionEnum } from '../api/generated';

type PerSession = {
    arrayStrategies: Record<string, ArrayStrategy>;
    selections: Record<string, MergeSelection>;
};

type DiffFuseState = {
    bySessionId: Record<string, PerSession>;

    // helpers
    ensure: (sessionId: string) => void;

    // array strategies
    setArrayStrategy: (sessionId: string, path: string, strategy: ArrayStrategy) => void;
    clearArrayStrategy: (sessionId: string, path: string) => void;

    // selections
    selectDoc: (sessionId: string, path: string, docId: string) => void;
    clearSelection: (sessionId: string, path: string) => void;
    clearAllSelections: (sessionId: string) => void;
};

function empty(): PerSession {
    return { arrayStrategies: {}, selections: {} };
}

export const useDiffFuseStore = create<DiffFuseState>()(
    persist(
        (set, get) => ({
            bySessionId: {},

            ensure: (sessionId) => {
                const cur = get().bySessionId[sessionId];
                if (cur) return;
                set((s) => ({ bySessionId: { ...s.bySessionId, [sessionId]: empty() } }));
            },

            setArrayStrategy: (sessionId, path, strategy) => {
                get().ensure(sessionId);
                set((s) => ({
                    bySessionId: {
                        ...s.bySessionId,
                        [sessionId]: {
                            ...s.bySessionId[sessionId],
                            arrayStrategies: { ...s.bySessionId[sessionId].arrayStrategies, [path]: strategy },
                        },
                    },
                }));
            },

            clearArrayStrategy: (sessionId, path) => {
                get().ensure(sessionId);
                set((s) => {
                    const next = { ...s.bySessionId[sessionId].arrayStrategies };
                    delete next[path];
                    return {
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: { ...s.bySessionId[sessionId], arrayStrategies: next },
                        },
                    };
                });
            },

            selectDoc: (sessionId, path, docId) => {
                get().ensure(sessionId);
                set((s) => ({
                    bySessionId: {
                        ...s.bySessionId,
                        [sessionId]: {
                            ...s.bySessionId[sessionId],
                            selections: {
                                ...s.bySessionId[sessionId].selections,
                                [path]: { kind: MergeSelectionEnum.kind.DOC, doc_id: docId },
                            },
                        },
                    },
                }));
            },

            clearSelection: (sessionId, path) => {
                get().ensure(sessionId);
                set((s) => {
                    const next = { ...s.bySessionId[sessionId].selections };
                    delete next[path];
                    return {
                        bySessionId: {
                            ...s.bySessionId,
                            [sessionId]: { ...s.bySessionId[sessionId], selections: next },
                        },
                    };
                });
            },

            clearAllSelections: (sessionId) => {
                get().ensure(sessionId);
                set((s) => ({
                    bySessionId: {
                        ...s.bySessionId,
                        [sessionId]: { ...s.bySessionId[sessionId], selections: {} },
                    },
                }));
            },
        }),
        {
            name: 'diff-fuse-ui',
            partialize: (s) => ({ bySessionId: s.bySessionId }),
        }
    )
);