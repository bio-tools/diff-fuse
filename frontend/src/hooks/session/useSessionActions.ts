import { useEffect, useMemo } from 'react';
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
 * URL wins. If URL changes, we clear local state and refetch docs-meta.
 */
export function useSessionBoot() {
    const { sessionId: routeSessionId } = useParams();
    const navigate = useNavigate();

    const { sessionId: storeSessionId, clearSession, setSession } = useSessionStore((s) => ({
        sessionId: s.sessionId,
        clearSession: s.clearSession,
        setSession: s.setSession,
    }));

    // URL is source of truth
    const effectiveSessionId = useMemo(
        () => routeSessionId ?? storeSessionId ?? null,
        [routeSessionId, storeSessionId]
    );

    // If URL session differs from store session, reset store (prevents "double id" confusion)
    useEffect(() => {
        if (routeSessionId && storeSessionId && routeSessionId !== storeSessionId) {
            clearSession();
        }
    }, [routeSessionId, storeSessionId, clearSession]);

    const docsMetaQuery = useApiQuery<SessionResponse>({
        queryKey: effectiveSessionId ? qk.docsMeta(effectiveSessionId) : ['docsMeta', 'disabled'],
        enabled: !!effectiveSessionId,
        queryFn: () => api.docsMeta(effectiveSessionId!),
        staleTime: 30_000,
        onSuccess: (res) => {
            // keep Zustand in sync with server response
            setSession(res.session_id, res.documents_meta);

            // normalize URL if needed (e.g. backend returns canonical id)
            if (routeSessionId !== res.session_id) {
                navigate(`/s/${res.session_id}`, { replace: true });
            }
        },
    });

    return { effectiveSessionId, docsMetaQuery };
}

/**
 * Create session (magic):
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

            // seed cache so UI updates instantly
            qc.setQueryData(qk.docsMeta(res.session_id), res);

            navigate(`/s/${res.session_id}`, { replace: true });

            // any session-scoped data becomes stale now
            qc.invalidateQueries({ queryKey: qk.session(res.session_id) });
        },
    });
}

/**
 * Add docs (magic):
 * - updates Zustand docsMeta only
 * - updates cache
 * - invalidates diff-ish session data
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
 * Remove doc (magic):
 * - updates Zustand docsMeta only
 * - updates cache
 * - invalidates diff-ish session data
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