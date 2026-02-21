import React from 'react';

export type LocalDraft = {
    doc_id: string;
    name: string;
    content: string;
};

function newDraft(i: number): LocalDraft {
    return { doc_id: crypto.randomUUID(), name: `Doc ${i}`, content: '' };
}

export function useLocalDrafts(enabled: boolean, keepAtLeastOne = true) {
    const [drafts, setDrafts] = React.useState<LocalDraft[]>(() => [newDraft(1)]);

    React.useEffect(() => {
        if (!enabled) return;
        if (!keepAtLeastOne) return;

        if (drafts.length === 0) setDrafts([newDraft(1)]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, keepAtLeastOne, drafts.length]);

    const addDraft = React.useCallback(() => {
        setDrafts((s) => [...s, newDraft(s.length + 1)]);
    }, []);

    const updateDraft = React.useCallback((docId: string, patch: Partial<Pick<LocalDraft, 'name' | 'content'>>) => {
        setDrafts((s) => s.map((d) => (d.doc_id === docId ? { ...d, ...patch } : d)));
    }, []);

    const removeDraft = React.useCallback((docId: string) => {
        setDrafts((s) => s.filter((d) => d.doc_id !== docId));
    }, []);

    const clearDrafts = React.useCallback(() => {
        setDrafts([]);
    }, []);

    return { drafts, addDraft, updateDraft, removeDraft, clearDrafts };
}