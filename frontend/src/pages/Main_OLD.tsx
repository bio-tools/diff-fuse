import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useUIStore } from '../state/uiStore';
import { useSessionStore } from '../state/sessionStore';

import AddDocsModal from '../components/AddDocsModal';
import { useSessionBoot } from '../hooks/session/useSessionActions';

import RawJsonsPanel from '../components/RawJsonsPanel';
import DiffFusePanel from '../components/DiffFusePanel';

export default function Main() {
    const navigate = useNavigate();

    const modal = useUIStore((s) => s.modal);
    const openModal = useUIStore((s) => s.openModal);
    const closeModal = useUIStore((s) => s.closeModal);

    const documentsMeta = useSessionStore((s) => s.documentsMeta);
    const clearSession = useSessionStore((s) => s.clearSession);

    const { effectiveSessionId, docsMetaQuery } = useSessionBoot();

    const startNew = () => {
        clearSession();
        navigate('/', { replace: true });
    };

    return (
        <div style={{ padding: 24 }}>
            <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <h1>diff-fuse</h1>
                {effectiveSessionId && <code style={{ opacity: 0.7 }}>session={effectiveSessionId}</code>}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button onClick={() => openModal({ kind: 'addDocs' })} disabled={!effectiveSessionId}>
                        Add docs
                    </button>
                    <button onClick={startNew}>New session</button>
                </div>
            </header>

            <main style={{ marginTop: 24 }}>
                {!effectiveSessionId ? (
                    <div>
                        <p>No session yet. Create one by pasting documents.</p>
                        <button onClick={() => openModal({ kind: 'addDocs' })}>Create session</button>
                    </div>
                ) : docsMetaQuery.isLoading ? (
                    <p>Loading session…</p>
                ) : docsMetaQuery.isError ? (
                    <div>
                        <p>Session not found / expired.</p>
                        <button onClick={startNew}>Start new</button>
                    </div>
                ) : (
                    <div>
                        <h2>Documents</h2>
                        <ul>
                            {documentsMeta.map((d) => (
                                <li key={d.doc_id}>
                                    <strong>{d.name}</strong> — {d.ok ? 'OK' : `ERROR: ${d.error ?? 'unknown'}`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>

            {modal.kind === 'addDocs' && (
                <div>
                    <AddDocsModal />
                    <div style={{ marginTop: 24, padding: 12, border: '1px solid #ccc' }}>
                        <h3>Add docs modal</h3>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}