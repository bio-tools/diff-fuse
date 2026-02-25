import React from 'react';
import { toast } from 'sonner';
import { Card } from '../shared/cards/Card';
import { Error } from '../shared/Error';
import { CardTitle } from '../shared/cards/CardTitle';
import { DocPanel } from './DocInput';
import { Check, Plus } from 'lucide-react';

import { useSessionId } from '../../hooks/session/useSessionId';
import { useFullSession } from '../../hooks/session/useSession';
import { useLocalDrafts } from '../../hooks/docs/useLocalDrafts';
import { useDocsCommit } from '../../hooks/docs/useDocsCommit';

export function Input() {
    const sessionId = useSessionId();
    const isInSession = sessionId !== null;

    const draftsEnabled = !isInSession;
    const { drafts, addDraft, updateDraft, removeDraft, removeDrafts, clearDrafts } =
        useLocalDrafts(draftsEnabled);

    // server truth when in session
    const full = useFullSession(sessionId);
    const serverDocs = full.data?.documents_results ?? [];

    const commit = useDocsCommit({ sessionId, drafts, serverDocs });

    const busy =
        (isInSession && full.isLoading) ||
        commit.createSession.isPending ||
        commit.addDocs.isPending ||
        commit.removeDoc.isPending;

    React.useEffect(() => {
        console.log('drafts changed:', drafts.map(d => d.doc_id));
    }, [drafts]);

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
            content: d.raw ?? '',
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
        <button type="button" className="button ok" disabled={busy} onClick={onCommit}>
            <Check className="icon" />
        </button>
    );

    return (
        <Card title={<CardTitle title="Raw JSONs" rightButtons={rightButtons} />} defaultOpen={true}>
            {isInSession && full.isLoading ? (
                <div>Loading session…</div>
            ) : (
                <div className="scrollablePanelsRow">
                    {/* 1) server docs (only if in session) */}
                    {serverRows.map((r) => (
                        <div key={r.doc_id} className="scrollablePanelItem">
                            {!r.ok && <Error error={`Parse error: ${String(r.error ?? 'unknown')}`} />}
                            <DocPanel
                                draft={{ doc_id: r.doc_id, name: r.name, content: r.content }}
                                isBusy={busy}
                                inSession={true}
                                onUpdate={() => { }}
                                onTrash={() => commit.trashServer(r.doc_id)}
                            />
                        </div>
                    ))}

                    {/* 2) drafts (always editable, even in session) */}
                    {draftRows.map((r) => (
                        <div key={r.doc_id} className="scrollablePanelItem">
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
                    <button
                        type="button"
                        className="nonScrollablePanelItem button primary"
                        onClick={addDraft}
                        disabled={busy}
                    >
                        <Plus className="icon" />
                    </button>

                    {/* Error loading session */}
                    {isInSession && full.isError && (
                        <Error error={`Full session load failed: ${String(full.error)}`} />
                    )}
                </div>
            )}
        </Card>
    );
}