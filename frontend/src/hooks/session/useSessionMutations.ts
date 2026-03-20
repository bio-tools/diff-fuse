/**
 * Session mutation hooks.
 *
 * These hooks wrap backend session mutations and keep the router and query cache
 * aligned with the server response.
 */

import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../api/useApiMutation';
import { api } from '../../api/diffFuse';
import type { AddDocsSessionRequest, RemoveDocSessionRequest, SessionResponse } from '../../api/generated';

/**
 * Create a new backend session from uploaded drafts.
 *
 * On success:
 * - the route becomes `/s/:sessionId`
 * - session queries are invalidated so server truth becomes visible
 */
export function useCreateSession() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useApiMutation<SessionResponse, AddDocsSessionRequest>({
        mutationFn: (body) => api.createSession(body),
        onSuccess: (res) => {
            // Route is truth
            navigate(`/s/${res.session_id}`, { replace: true });

            // Make the new session “warm”
            qc.invalidateQueries({ queryKey: ["session", res.session_id] });
        },
    });
}

/**
 * Add documents to an existing backend session and invalidate session queries.
 */
export function useAddDocs() {
    const qc = useQueryClient();
    type Vars = { sessionId: string; body: AddDocsSessionRequest };

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.addDocs(sessionId, body),
        onSuccess: (_res, vars) => {
            // qc.invalidateQueries({ queryKey: qk.fullSession(vars.sessionId) });
            qc.invalidateQueries({ queryKey: ["session", vars.sessionId] });
        },
    });
}

/**
 * Remove one document from an existing backend session and invalidate session queries.
 */
export function useRemoveDoc() {
    const qc = useQueryClient();
    type Vars = { sessionId: string; body: RemoveDocSessionRequest };

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.removeDoc(sessionId, body),
        onSuccess: (_res, vars) => {
            // qc.invalidateQueries({ queryKey: qk.fullSession(vars.sessionId) });
            qc.invalidateQueries({ queryKey: ["session", vars.sessionId] });
        },
    });
}