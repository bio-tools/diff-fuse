import React from 'react';
import { useDraftsStore } from '../../state/draftsStore';

export function useLocalDrafts(enabled: boolean, autoEnsureOne: boolean) {
    const drafts = useDraftsStore((s) => s.drafts);
    const addDraft = useDraftsStore((s) => s.addDraft);
    const updateDraft = useDraftsStore((s) => s.updateDraft);
    const removeDraft = useDraftsStore((s) => s.removeDraft);
    const removeDrafts = useDraftsStore((s) => s.removeDrafts);
    const clearDrafts = useDraftsStore((s) => s.clearDrafts);
    const ensureAtLeastOneDraft = useDraftsStore((s) => s.ensureAtLeastOneDraft);

    React.useEffect(() => {
        if (!enabled) return;
        if (!autoEnsureOne) return;
        ensureAtLeastOneDraft();
    }, [enabled, autoEnsureOne, ensureAtLeastOneDraft]);

    return { drafts, addDraft, updateDraft, removeDraft, removeDrafts, clearDrafts };
}