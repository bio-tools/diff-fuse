import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useApiQuery } from '../useApiQuery';
import { useApiMutation } from '../useApiMutation';

import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';

import type {
    AddDocsSessionRequest,
    RemoveDocSessionRequest,
    SessionResponse,
} from '../../api/generated';

import { useSessionStore } from '../../state/sessionStore';

/**
 * Boot + keep session state in sync with the URL.
 * URL wins. Store follows.
 */
export function useSessionBoot() {
    const { sessionId: routeSessionId } = useParams();
    const navigate = useNavigate();

    const effectiveSessionId = routeSessionId ?? null;

    const storeSessionId = useSessionStore((s) => s.sessionId);
    const documentsMeta = useSessionStore((s) => s.documentsMeta);
    const clearSession = useSessionStore((s) => s.clearSession);
    const setSession = useSessionStore((s) => s.setSession);
    const setDocumentsMeta = useSessionStore((s) => s.setDocumentsMeta);

    // If there's no session in URL, we consider there is no session at all.
    useEffect(() => {
        if (!effectiveSessionId && storeSessionId) {
            clearSession();
        }
    }, [effectiveSessionId, storeSessionId, clearSession]);

    const docsMetaQuery = useApiQuery<SessionResponse>({
        queryKey: effectiveSessionId ? qk.docsMeta(effectiveSessionId) : ['docsMeta', 'disabled'],
        enabled: !!effectiveSessionId,
        queryFn: () => api.docsMeta(effectiveSessionId!),
        staleTime: 30_000,
    });

    // Sync query result -> zustand store (guarded to avoid infinite loops)
    useEffect(() => {
        const data = docsMetaQuery.data;
        if (!effectiveSessionId || !data) return;

        // normalize URL if backend returns canonical id
        if (routeSessionId && data.session_id !== routeSessionId) {
            navigate(`/s/${data.session_id}`, { replace: true });
            return;
        }

        // Only write to store if something actually changed
        if (storeSessionId !== data.session_id) {
            setSession(data.session_id, data.documents_meta);
            return;
        }

        // session id same: update docs only if length or content changed
        // (cheap-ish guard; upgrade later if needed)
        const changed =
            documentsMeta.length !== data.documents_meta.length ||
            documentsMeta.some((d, i) => {
                const nd = data.documents_meta[i];
                return (
                    !nd ||
                    d.doc_id !== nd.doc_id ||
                    d.ok !== nd.ok ||
                    d.name !== nd.name ||
                    d.error !== nd.error
                );
            });

        if (changed) {
            setDocumentsMeta(data.documents_meta);
        }
    }, [
        docsMetaQuery.data,
        effectiveSessionId,
        routeSessionId,
        navigate,
        storeSessionId,
        documentsMeta,
        setSession,
        setDocumentsMeta,
    ]);

    return { effectiveSessionId, docsMetaQuery };
}

/**
 * Create session:
 * - creates on backend
 * - writes Zustand
 * - seeds query cache
 * - navigates to /s/:sessionId
 */
export function useCreateSessionAction() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const setSession = useSessionStore((s) => s.setSession);

    return useApiMutation<SessionResponse, AddDocsSessionRequest>({
        mutationFn: (body) => api.createSession(body),
        onSuccess: (res) => {
            setSession(res.session_id, res.documents_meta);
            qc.setQueryData(qk.docsMeta(res.session_id), res);
            navigate(`/s/${res.session_id}`, { replace: true });
            qc.invalidateQueries({ queryKey: qk.session(res.session_id) });
        },
    });
}

/**
 * Add docs:
 * - updates docsMeta
 * - updates cache
 * - invalidates session-scoped data
 */
export function useAddDocsAction() {
    const qc = useQueryClient();
    const setDocumentsMeta = useSessionStore((s) => s.setDocumentsMeta);

    type Vars = { sessionId: string; body: AddDocsSessionRequest };

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.addDocs(sessionId, body),
        onSuccess: (res, vars) => {
            setDocumentsMeta(res.documents_meta);
            qc.setQueryData(qk.docsMeta(vars.sessionId), res);
            qc.invalidateQueries({ queryKey: qk.session(vars.sessionId) });
        },
    });
}

/**
 * Remove doc:
 * - updates docsMeta
 * - updates cache
 * - invalidates session-scoped data
 */
export function useRemoveDocAction() {
    const qc = useQueryClient();
    const setDocumentsMeta = useSessionStore((s) => s.setDocumentsMeta);

    type Vars = { sessionId: string; body: RemoveDocSessionRequest };

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.removeDoc(sessionId, body),
        onSuccess: (res, vars) => {
            setDocumentsMeta(res.documents_meta);
            qc.setQueryData(qk.docsMeta(vars.sessionId), res);
            qc.invalidateQueries({ queryKey: qk.session(vars.sessionId) });
        },
    });
}