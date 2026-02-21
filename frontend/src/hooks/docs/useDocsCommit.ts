import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCreateSessionAction, useAddDocsAction, useRemoveDocAction } from '../session/useSessionActions';
import type { LocalDraft } from './useLocalDrafts';
import { nonEmpty, toInputDoc } from '../../utils/docs';

export function useDocsCommit(args: {
    sessionId: string | null;
    drafts: LocalDraft[];
    serverDocIds: Set<string>;
    serverDocsCount: number;
}) {
    const { sessionId, drafts, serverDocIds, serverDocsCount } = args;

    const navigate = useNavigate();
    const createSession = useCreateSessionAction();
    const addDocs = useAddDocsAction();
    const removeDoc = useRemoveDocAction();

    const busy =
        createSession.isPending ||
        addDocs.isPending ||
        removeDoc.isPending;

    const createFromFirstNonEmptyDraft = React.useCallback(async () => {
        const first = drafts.find((d) => nonEmpty(d.content));
        if (!first) {
            toast.error('Add at least 1 non-empty document.');
            return;
        }
        const res = await createSession.mutateAsync({ documents: [toInputDoc(first)] });
        // defensive; action should navigate already
        if (res?.session_id) navigate(`/s/${res.session_id}`, { replace: true });
    }, [drafts, createSession, navigate]);

    const addNonEmptyDraftsToSession = React.useCallback(async () => {
        if (!sessionId) return;

        const nonEmptyDrafts = drafts.filter((d) => nonEmpty(d.content));
        const toAdd = nonEmptyDrafts.filter((d) => !serverDocIds.has(d.doc_id));

        if (toAdd.length === 0) {
            toast.message('No new docs to add.');
            return;
        }

        await addDocs.mutateAsync({ sessionId, body: { documents: toAdd.map(toInputDoc) } });
    }, [sessionId, drafts, serverDocIds, addDocs]);

    const trashServer = React.useCallback(async (docId: string) => {
        if (!sessionId) return;

        if (serverDocsCount <= 1) {
            toast.error('Keep at least 1 document in the session.');
            return;
        }

        await removeDoc.mutateAsync({ sessionId, body: { doc_id: docId } });
    }, [sessionId, serverDocsCount, removeDoc]);

    return {
        busy,
        createFromFirstNonEmptyDraft,
        addNonEmptyDraftsToSession,
        trashServer,
    };
}