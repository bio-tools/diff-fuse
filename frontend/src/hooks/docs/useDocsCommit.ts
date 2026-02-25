import React from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCreateSession, useAddDocs, useRemoveDoc } from '../session/useSessionMutations';
import type { LocalDraft } from '../../state/draftsStore';
import type { DocumentResult } from '../../api/generated';
import { nonEmpty, toInputDoc } from '../../utils/docs';

export function useDocsCommit(args: {
    sessionId: string | null;
    drafts: LocalDraft[];
    serverDocs: DocumentResult[];
}) {
    const { sessionId, drafts, serverDocs } = args;

    const navigate = useNavigate();
    const createSession = useCreateSession();
    const addDocs = useAddDocs();
    const removeDoc = useRemoveDoc();

    const busy = createSession.isPending || addDocs.isPending || removeDoc.isPending;

    const serverDocIds = React.useMemo(
        () => new Set(serverDocs.map((d) => d.doc_id)),
        [serverDocs]
    );

    const createFromNonEmptyDrafts = React.useCallback(async (): Promise<string[]> => {
        const toCreate = drafts.filter((d) => nonEmpty(d.content));

        if (toCreate.length === 0) {
            toast.error('Add at least 1 non-empty document.');
            return [];
        }

        const res = await createSession.mutateAsync({
            documents: toCreate.map(toInputDoc),
        });

        if (res?.session_id) {
            navigate(`/s/${res.session_id}`, { replace: true });
        }

        return toCreate.map((d) => d.doc_id);
    }, [drafts, createSession, navigate]);

    const addNonEmptyDraftsToSession = React.useCallback(async (): Promise<string[]> => {
        if (!sessionId) return [];

        const toAdd = drafts
            .filter((d) => nonEmpty(d.content))
            .filter((d) => !serverDocIds.has(d.doc_id));

        if (toAdd.length === 0) {
            toast.message('No new docs to add.');
            return [];
        }

        await addDocs.mutateAsync({
            sessionId,
            body: { documents: toAdd.map(toInputDoc) },
        });

        return toAdd.map((d) => d.doc_id);
    }, [sessionId, drafts, serverDocIds, addDocs]);

    const trashServer = React.useCallback(
        async (docId: string) => {
            if (!sessionId) return;

            if (serverDocs.length <= 1) {
                toast.error('Keep at least 1 document in the session.');
                return;
            }

            await removeDoc.mutateAsync({ sessionId, body: { doc_id: docId } });
        },
        [sessionId, serverDocs.length, removeDoc]
    );

    return {
        busy,
        createFromNonEmptyDrafts,
        addNonEmptyDraftsToSession,
        trashServer,
        createSession,
        addDocs,
        removeDoc,
    };
}