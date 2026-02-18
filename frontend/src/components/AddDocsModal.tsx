import React from 'react';
import type { InputDocument } from '../api/generated';
import { DocumentFormat } from '../api/generated';

import { useUIStore } from '../state/uiStore';
import { useSessionStore } from '../state/sessionStore';

import {
    useCreateSessionAction,
    useAddDocsAction,
} from '../hooks/session/useSessionActions';

function makeDoc(name: string, content: string): InputDocument {
    return {
        doc_id: crypto.randomUUID(),
        name,
        format: DocumentFormat.JSON,
        content,
    };
}

export default function AddDocsModal() {
    const closeModal = useUIStore((s) => s.closeModal);
    const sessionId = useSessionStore((s) => s.sessionId);

    const createSession = useCreateSessionAction();
    const addDocs = useAddDocsAction();

    const [docA, setDocA] = React.useState('');
    const [docB, setDocB] = React.useState('');
    const [nameA, setNameA] = React.useState('Doc A');
    const [nameB, setNameB] = React.useState('Doc B');

    const isBusy = createSession.isPending || addDocs.isPending;

    const submit = async () => {
        const docs: InputDocument[] = [makeDoc(nameA, docA), makeDoc(nameB, docB)];
        const body = { documents: docs };

        if (!sessionId) {
            await createSession.mutateAsync(body);
        } else {
            await addDocs.mutateAsync({ sessionId, body });
        }

        closeModal();
    };

    return (
        <div style={{ marginTop: 24, padding: 12, border: '1px solid #ccc' }}>
            <h3>{sessionId ? 'Add documents' : 'Create session'}</h3>

            <div style={{ display: 'grid', gap: 8 }}>
                <input value={nameA} onChange={(e) => setNameA(e.target.value)} />
                <textarea value={docA} onChange={(e) => setDocA(e.target.value)} rows={8} />

                <input value={nameB} onChange={(e) => setNameB(e.target.value)} />
                <textarea value={docB} onChange={(e) => setDocB(e.target.value)} rows={8} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={closeModal} disabled={isBusy}>
                    Cancel
                </button>
                <button onClick={submit} disabled={isBusy || !docA.trim() || !docB.trim()}>
                    {sessionId ? 'Add' : 'Create'}
                </button>
            </div>
        </div>
    );
}