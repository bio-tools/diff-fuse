import React from 'react';
import { toast } from 'sonner';
import { Card } from './shared/cards/Card';
import { CardTitle } from './shared/cards/CardTitle';
import { DocPanel } from './docPanel/DocPanel';
import { Check, Plus } from 'lucide-react';

import { useSessionId } from '../hooks/session/useSessionId';
import { useFullSession } from '../hooks/session/useSession';
import { useLocalDrafts } from '../hooks/docs/useLocalDrafts';
import { useDocsCommit } from '../hooks/docs/useDocsCommit';

export default function RawJsonsPanel() {
    const sessionId = useSessionId();          // ✅ URL truth, normalized
    const isInSession = sessionId !== null;

    // drafts only exist on "/"
    const draftsEnabled = !isInSession;
    const { drafts, addDraft, updateDraft, removeDraft } = useLocalDrafts(draftsEnabled);

    // server truth when in session
    const full = useFullSession(sessionId);
    const serverDocs = full.data?.documents_results ?? [];

    const {
        busy: commitBusy,
        createFromFirstNonEmptyDraft,
        addNonEmptyDraftsToSession,
        trashServer,
    } = useDocsCommit({
        sessionId,
        drafts,
        serverDocs,
    });

    const busy = commitBusy || full.isFetching;

    const trashLocal = (docId: string) => {
        if (drafts.length <= 1) {
            toast.error('Keep at least 1 draft.');
            return;
        }
        removeDraft(docId);
    };

    const rows = isInSession
        ? serverDocs.map((d) => ({
            doc_id: d.doc_id,
            name: d.name,
            content: d.raw ?? '',
            inSession: true,
            ok: d.ok,
            error: d.error,
        }))
        : drafts.map((d) => ({
            doc_id: d.doc_id,
            name: d.name,
            content: d.content,
            inSession: false,
            ok: true,
            error: null,
        }));

    const onCommit = isInSession ? addNonEmptyDraftsToSession : createFromFirstNonEmptyDraft;

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
                    {rows.map((r) => (
                        <div key={r.doc_id} className="scrollablePanelItem">
                            <div>
                                {!r.ok && (
                                    <div style={{ color: '#b00', fontSize: 12 }}>
                                        Parse error: {String(r.error ?? 'unknown')}
                                    </div>
                                )}

                                <DocPanel
                                    draft={{ doc_id: r.doc_id, name: r.name, content: r.content }}
                                    isBusy={busy}
                                    inSession={r.inSession}
                                    onUpdate={(id, patch) => updateDraft(id, patch)}
                                    onTrash={(id) => (isInSession ? trashServer(id) : trashLocal(id))}
                                />
                            </div>
                        </div>
                    ))}

                    {!isInSession && (
                        <button
                            type="button"
                            className="nonScrollablePanelItem button primary"
                            onClick={addDraft}
                            disabled={busy}
                        >
                            <Plus className="icon" />
                        </button>
                    )}
                </div>
            )}
        </Card>
    );
}