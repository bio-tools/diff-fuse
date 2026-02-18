import { create } from 'zustand';
import type { ArrayStrategy, MergeSelection } from '../api/generated';
import { MergeSelection as MergeSelectionEnum } from '../api/generated';

type DiffFuseState = {
    arrayStrategies: Record<string, ArrayStrategy>;
    setArrayStrategy: (path: string, strategy: ArrayStrategy) => void;
    clearArrayStrategy: (path: string) => void;

    selections: Record<string, MergeSelection>;
    selectDoc: (path: string, docId: string) => void;
    clearSelection: (path: string) => void;
    clearAllSelections: () => void;
};

export const useDiffFuseStore = create<DiffFuseState>((set) => ({
    arrayStrategies: {},
    setArrayStrategy: (path, strategy) =>
        set((s) => ({ arrayStrategies: { ...s.arrayStrategies, [path]: strategy } })),

    clearArrayStrategy: (path) =>
        set((s) => {
            const next = { ...s.arrayStrategies };
            delete next[path];
            return { arrayStrategies: next };
        }),

    selections: {},

    selectDoc: (path, docId) =>
        set((s) => ({
            selections: {
                ...s.selections,
                [path]: {
                    kind: MergeSelectionEnum.kind.DOC,
                    doc_id: docId,
                },
            },
        })),

    clearSelection: (path) =>
        set((s) => {
            const next = { ...s.selections };
            delete next[path];
            return { selections: next };
        }),

    clearAllSelections: () => set({ selections: {} }),
}));