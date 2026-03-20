/**
 * Commit local draft documents into backend session state.
 *
 * This hook centralizes the workflow differences between:
 * - creating a brand-new session from drafts
 * - adding new drafts to an existing session
 * - removing server-side documents from an existing session
 */

import React from "react";
import { toast } from "sonner";
import type { DocumentResult } from "../../api/generated";
import type { LocalDraft } from "../../state/draftsStore";
import { useAddDocs, useCreateSession, useRemoveDoc } from "../session/useSessionMutations";
import { nonEmpty, toInputDoc } from "./docsUtils";

/**
 * Build document commit actions for the current editing context.
 *
 * Notes
 * -----
 * - Local drafts and server documents are intentionally treated as separate sources.
 * - Empty drafts are ignored for create/add operations.
 * - Adding to an existing session skips drafts whose `doc_id` already exists server-side.
 */
export function useDocsCommit(args: { sessionId: string | null; drafts: LocalDraft[]; serverDocs: DocumentResult[] }) {
    const { sessionId, drafts, serverDocs } = args;

    const createSession = useCreateSession();
    const addDocs = useAddDocs();
    const removeDoc = useRemoveDoc();

    const busy = createSession.isPending || addDocs.isPending || removeDoc.isPending;

    // Used to prevent re-adding drafts that already exist in the session.
    const serverDocIds = React.useMemo(() => new Set(serverDocs.map((d) => d.doc_id)), [serverDocs]);

    // Session creation only includes drafts with actual content.
    const createFromNonEmptyDrafts = React.useCallback(async (): Promise<string[]> => {
        const toCreate = drafts.filter((d) => nonEmpty(d.content));

        if (toCreate.length === 0) {
            toast.error("Add at least 1 non-empty document.");
            return [];
        }

        await createSession.mutateAsync({
            documents: toCreate.map(toInputDoc),
        });

        return toCreate.map((d) => d.doc_id);
    }, [drafts, createSession]);

    // Only add drafts that both:
    /// 1) have content
    /// 2) are not already present in the current session
    const addNonEmptyDraftsToSession = React.useCallback(async (): Promise<string[]> => {
        if (!sessionId) return [];

        const toAdd = drafts.filter((d) => nonEmpty(d.content)).filter((d) => !serverDocIds.has(d.doc_id));

        if (toAdd.length === 0) {
            toast.message("No new docs to add.");
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

            // Mirror backend constraints in the UI to avoid a pointless failing request.
            if (serverDocs.length <= 1) {
                toast.error("Keep at least 1 document in the session.");
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
