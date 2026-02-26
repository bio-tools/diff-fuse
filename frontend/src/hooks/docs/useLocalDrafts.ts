import React from 'react';
import { useDraftsStore } from '../../state/draftsStore';

export function useLocalDrafts(draftsEnabled: boolean) {
    const drafts = useDraftsStore((s) => s.drafts);
    const addDraft = useDraftsStore((s) => s.addDraft);
    const updateDraft = useDraftsStore((s) => s.updateDraft);
    const removeDraft = useDraftsStore((s) => s.removeDraft);
    const removeDrafts = useDraftsStore((s) => s.removeDrafts);
    const clearDrafts = useDraftsStore((s) => s.clearDrafts);

    const ensureAtLeastOneDraft = useDraftsStore((s) => s.ensureAtLeastOneDraft);

    React.useEffect(() => {
        if (!draftsEnabled) return;
        ensureAtLeastOneDraft();
    }, [draftsEnabled, ensureAtLeastOneDraft]);

    return { drafts, addDraft, updateDraft, removeDraft, removeDrafts, clearDrafts };
}