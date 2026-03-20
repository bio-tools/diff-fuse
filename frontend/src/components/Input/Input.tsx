/**
 * Raw document input area.
 *
 * This component shows:
 * - server-side documents already stored in the active session
 * - local draft documents not yet committed
 *
 * The route determines whether the page is in "pre-session" or "in-session" mode.
 */

import { Check, Plus } from "lucide-react";
import type React from "react";
import { useDocsCommit } from "../../hooks/docs/useDocsCommit";
import { useLocalDrafts } from "../../hooks/docs/useLocalDrafts";
import { useFullSession } from "../../hooks/session/useSession";
import { useSessionId } from "../../hooks/session/useSessionId";
import { Card } from "../shared/cards/Card";
import { CardTitle } from "../shared/cards/CardTitle";
import { Error } from "../shared/Error";
import { DocPanel } from "./DocInput";

type Props = {
    docStripRef?: React.RefCallback<HTMLDivElement>;
};

export function Input({ docStripRef }: Props) {
    const sessionId = useSessionId();
    const isInSession = sessionId !== null;

    const draftsEnabled = true;
    const autoEnsureOne = !isInSession;
    const { drafts, addDraft, updateDraft, removeDraft, removeDrafts, clearDrafts } = useLocalDrafts(
        draftsEnabled,
        autoEnsureOne
    );

    // server truth when in session
    const full = useFullSession(sessionId);
    const serverDocs = full.data?.documents_results ?? [];

    const commit = useDocsCommit({ sessionId, drafts, serverDocs });

    const busy =
        (isInSession && full.isLoading) ||
        commit.createSession.isPending ||
        commit.addDocs.isPending ||
        commit.removeDoc.isPending;

    const onCommit = async () => {
        if (!isInSession) {
            const usedIds = await commit.createFromNonEmptyDrafts();
            clearDrafts();

            // (optional alternative) if you prefer keeping empty drafts around on "/":
            // removeDrafts(usedIds);

            return;
        }

        const addedIds = await commit.addNonEmptyDraftsToSession();
        removeDrafts(addedIds);
    };

    const trashLocal = (docId: string) => removeDraft(docId);

    const serverRows = isInSession
        ? serverDocs.map((d) => ({
              doc_id: d.doc_id,
              name: d.name,
              content: d.raw ?? "",
              inSession: true,
              ok: d.ok,
              error: d.error,
          }))
        : [];

    const draftRows = drafts.map((d) => ({
        doc_id: d.doc_id,
        name: d.name,
        content: d.content,
        inSession: false,
        ok: true,
        error: null,
    }));

    const rightButtons = (
        <>
            <button type="button" className="button ok" disabled={busy} onClick={onCommit}>
                <Check className="icon" />
            </button>
        </>
    );

    return (
        <div className="inputRowSized">
            <Card title={<CardTitle title="Raw JSONs" rightButtons={rightButtons} />} defaultOpen={true}>
                {isInSession && full.isLoading ? (
                    <div>Loading session…</div>
                ) : (
                    <div className="docStrip" ref={docStripRef}>
                        <div className="docStripInner">
                            {/* 1) Server documents are read-only snapshots of backend session state. */}
                            {serverRows.map((r) => (
                                <div key={r.doc_id} className="docCol">
                                    {!r.ok && <Error error={`Parse error: ${String(r.error ?? "unknown")}`} />}
                                    <DocPanel
                                        draft={{ doc_id: r.doc_id, name: r.name, content: r.content }}
                                        isBusy={busy}
                                        inSession={true}
                                        onUpdate={() => {}}
                                        onTrash={() => commit.trashServer(r.doc_id)}
                                    />
                                </div>
                            ))}

                            {/* 2) Drafts remain locally editable and can be appended to the session later. */}
                            {draftRows.map((r) => (
                                <div key={r.doc_id} className="docCol">
                                    <DocPanel
                                        draft={{ doc_id: r.doc_id, name: r.name, content: r.content }}
                                        isBusy={busy}
                                        inSession={false}
                                        onUpdate={(id, patch) => updateDraft(id, patch)}
                                        onTrash={(id) => trashLocal(id)}
                                    />
                                </div>
                            ))}

                            {/* add doc button */}
                            <div className="nonscrollableButton">
                                <button type="button" className="button primary" onClick={addDraft} disabled={busy}>
                                    <Plus className="icon" />
                                </button>
                            </div>

                            {/* Error loading session */}
                            {isInSession && full.isError && (
                                <Error error={`Full session load failed: ${String(full.error)}`} />
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
