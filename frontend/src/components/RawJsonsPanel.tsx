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
import type { InputDocument } from '../api/generated';
import { DocumentFormat } from '../api/generated';

function toInputDoc(d: any): InputDocument {
    return {
        doc_id: d.doc_id,
        name: d.name ?? d.title ?? 'Untitled',
        format: DocumentFormat.JSON,
        content: d.content ?? '',
    };
}

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

    const committingRef = React.useRef(false);

    const commit = async () => {
        if (committingRef.current) return;
        committingRef.current = true;
        const nonEmptyDrafts = drafts.filter((d) => isNonEmptyJsonLike(d.content));

        try {
            if (!sessionId) {
                if (nonEmptyDrafts.length < 2) {
                    toast.error('Need at least 2 non-empty documents to create a session.');
                    return;
                }

                const docs = nonEmptyDrafts.slice(0, 2).map(toInputDoc);
                await createSession.mutateAsync({ documents: docs });
                return;
            }

            const toAddDrafts = nonEmptyDrafts.filter((d) => !inSession.has(d.doc_id));
            if (toAddDrafts.length === 0) {
                toast.message('No new documents to add.');
                return;
            }

            const docsToAdd = toAddDrafts.map(toInputDoc);
            await addDocs.mutateAsync({ sessionId, body: { documents: docsToAdd } });
        } catch (e) {
            // Important: swallow error so UI stays usable
            // Toast already happens in useApiMutation by default, but double-toasting is annoying.
            // So either rely on hook toast OR show it here. Pick ONE.

            // Option A: rely on hook toast (recommended)
            // do nothing

            // Option B: show here instead (if you set toastOnError: false in hooks)
            // toast.error(getErrorMessage(e));

            return;
        } finally {
            committingRef.current = false;
        }
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
    );
}