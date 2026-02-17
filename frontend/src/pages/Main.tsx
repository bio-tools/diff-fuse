import React from 'react';
import { useUIStore } from '../state/uiStore';
import { useSessionStore } from '../state/sessionStore';
import { getSessionIdFromUrl, clearSessionIdInUrl } from '../utils/sessionUrl';
import { useDocsMeta } from '../hooks/useSession';

export default function Main() {
    const { modal, openModal, closeModal } = useUIStore();
    const { sessionId, documentsMeta, clearSession } = useSessionStore();

    // Boot: read URL -> set sessionId by fetching docs meta
    const initialSessionId = React.useMemo(() => getSessionIdFromUrl(), []);
    const effectiveSessionId = sessionId ?? initialSessionId;

    const docsMetaQuery = useDocsMeta(effectiveSessionId);

    const startNew = () => {
        clearSession();
        clearSessionIdInUrl();
    };

    return (
        <div style={{ padding: 24 }}>
            <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <h1>diff-fuse</h1>
                {effectiveSessionId && (
                    <code style={{ opacity: 0.7 }}>session={effectiveSessionId}</code>
                )}
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

                        {/* Next: Diff panel, Merge panel, etc */}
                    </div>
                )}
            </main>

            {/* Modals would go here */}
            {modal.kind === 'addDocs' && (
                <div>
                    {/* Replace with proper modal */}
                    <div style={{ marginTop: 24, padding: 12, border: '1px solid #ccc' }}>
                        <h3>Add docs modal placeholder</h3>
                        <button onClick={closeModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}