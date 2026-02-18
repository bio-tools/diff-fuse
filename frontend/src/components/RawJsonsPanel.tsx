import React from 'react';
import { useRawDocsStore } from '../state/rawDocsStore';
import { useSessionStore } from '../state/sessionStore';
import styles from './ScrollableContent.module.css';
import { useCreateSessionAction, useAddDocsAction, useRemoveDocAction } from '../hooks/session/useSessionActions';
import { toast } from 'sonner';
import { Card } from './shared/cards/Card';
import { CardTitle } from './shared/cards/CardTitle';
import { DocPanel } from './docPanel/DocPanel';
import { Check, Plus } from 'lucide-react';

function isNonEmptyJsonLike(s: string) {
    return s.trim().length > 0;
}

export default function RawJsonsPanel() {
    const drafts = useRawDocsStore((s) => s.drafts);
    const addDraft = useRawDocsStore((s) => s.addDraft);
    const updateDraft = useRawDocsStore((s) => s.updateDraft);
    const removeDraft = useRawDocsStore((s) => s.removeDraft);
    const ensureAtLeast = useRawDocsStore((s) => s.ensureAtLeast);

    const sessionId = useSessionStore((s) => s.sessionId);
    const documentsMeta = useSessionStore((s) => s.documentsMeta);

    const createSession = useCreateSessionAction();
    const addDocs = useAddDocsAction();
    const removeDoc = useRemoveDocAction();

    React.useEffect(() => {
        ensureAtLeast(2);
    }, [ensureAtLeast]);

    const isBusy = createSession.isPending || addDocs.isPending || removeDoc.isPending;

    const inSession = new Set(documentsMeta.map((d) => d.doc_id));

    const commit = async () => {
        const nonEmpty = drafts.filter((d) => isNonEmptyJsonLike(d.content));
        if (nonEmpty.length < 2 && !sessionId) {
            toast.error('Need at least 2 non-empty documents to create a session.');
            return;
        }

        if (!sessionId) {
            await createSession.mutateAsync({ documents: nonEmpty.slice(0, 2) });
            return;
        }

        const toAdd = nonEmpty.filter((d) => !inSession.has(d.doc_id));
        if (toAdd.length === 0) {
            toast.message('No new documents to add.');
            return;
        }
        await addDocs.mutateAsync({ sessionId, body: { documents: toAdd } });
    };

    const trash = async (docId: string) => {
        const isInSession = inSession.has(docId);

        if (isInSession) {
            if (documentsMeta.length <= 2) {
                toast.error('You must keep at least 2 documents in the session.');
                return;
            }
            if (!sessionId) return;
            await removeDoc.mutateAsync({ sessionId, body: { doc_id: docId } });
            return;
        }

        // local-only
        if (!sessionId && drafts.length <= 2) {
            toast.error('You must keep at least 2 documents.');
            return;
        }
        removeDraft(docId);
    };

    const rightButtons = (
        <>
            <button type="button" className="button ok" onClick={commit} disabled={isBusy}><Check className="icon" /></button>
        </>
    );

    const titleView = CardTitle({
        title: "Raw JSONs",
        rightButtons: rightButtons,
    })

    const contentView = (
        <div className={styles.panelsRow}>
            {drafts.map((d) => (
                <DocPanel
                    key={d.doc_id}
                    draft={d}
                    isBusy={isBusy}
                    inSession={inSession.has(d.doc_id)}
                    onUpdate={updateDraft}
                    onTrash={trash}
                />
            ))}
            <button type="button" className="button primary" onClick={addDraft} disabled={isBusy}><Plus className="icon" /></button>
        </div>
    );

    return (
        Card({
            title: titleView,
            children: contentView,
            defaultOpen: true,
        })
        // <Collapsible title="raw jsons" right={right} defaultOpen>
        //     <div style={{ display: 'grid', gap: 12 }}>
        //         {drafts.map((d) => (
        //             <div
        //                 key={d.doc_id}
        //                 style={{
        //                     display: 'grid',
        //                     gridTemplateColumns: '1fr 1fr auto',
        //                     gap: 12,
        //                     alignItems: 'start',
        //                 }}
        //             >
        //                 <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: 8 }}>
        //                     <input
        //                         value={d.name}
        //                         onChange={(e) => updateDraft(d.doc_id, { name: e.target.value })}
        //                         style={{ flex: 1 }}
        //                     />
        //                     <button onClick={() => trash(d.doc_id)} disabled={isBusy}>🗑</button>
        //                 </div>

        //                 <textarea
        //                     value={d.content}
        //                     onChange={(e) => updateDraft(d.doc_id, { content: e.target.value })}
        //                     rows={10}
        //                     style={{ gridColumn: '1 / span 2', width: '100%', fontFamily: 'monospace' }}
        //                     placeholder="{ ... }"
        //                 />

        //                 <div style={{ gridColumn: '3', opacity: 0.7 }}>
        //                     {inSession.has(d.doc_id) ? 'in session' : 'draft'}
        //                 </div>
        //             </div>
        //         ))}
        //     </div>
        // </Collapsible>
    );
}