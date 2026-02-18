import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUIStore } from '../state/uiStore';
import { useSessionStore } from '../state/sessionStore';
import { useDocsMeta } from '../hooks/useSession';
import AddDocsModal from '../components/AddDocsModal';

export default function Main() {
    const navigate = useNavigate();
    const { sessionId: routeSessionId } = useParams<{ sessionId?: string }>();

    const { modal, openModal, closeModal } = useUIStore();
    const { sessionId: storeSessionId, documentsMeta, clearSession, setSession } = useSessionStore();

    // Rule: route param wins. Store is just cached UI state.
    const effectiveSessionId = routeSessionId ?? storeSessionId ?? null;

    // If we landed on /s/:id, but the store still has another id, drop it.
    React.useEffect(() => {
        if (routeSessionId && storeSessionId && routeSessionId !== storeSessionId) {
            // Clear stale store session; docsMeta query will repopulate correctly.
            clearSession();
        }
    }, [routeSessionId, storeSessionId, clearSession]);

    const docsMetaQuery = useDocsMeta(effectiveSessionId);

    const startNew = () => {
        clearSession();
        navigate('/', { replace: true });
    };

    const canAddDocs = !!effectiveSessionId;

    return (
        <div style={{ padding: 24 }}>
            <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <h1>diff-fuse</h1>

                {effectiveSessionId && <code style={{ opacity: 0.7 }}>session={effectiveSessionId}</code>}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button onClick={() => openModal({ kind: 'addDocs' })} disabled={!canAddDocs}>
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
                    <button onClick={closeModal} style={{ marginTop: 12 }}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}