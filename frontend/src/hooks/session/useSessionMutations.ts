import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../api/useApiMutation';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import type { AddDocsSessionRequest, RemoveDocSessionRequest, SessionResponse } from '../../api/generated';

export function useCreateSession() {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useApiMutation<SessionResponse, AddDocsSessionRequest>({
        mutationFn: (body) => api.createSession(body),
        onSuccess: (res) => {
            // Route is truth
            navigate(`/s/${res.session_id}`, { replace: true });

            // Make the new session “warm”
            qc.invalidateQueries({ queryKey: qk.fullSession(res.session_id) });
            qc.invalidateQueries({ queryKey: qk.session(res.session_id) });
        },
    });
}

export function useAddDocs() {
    const qc = useQueryClient();
    type Vars = { sessionId: string; body: AddDocsSessionRequest };

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.addDocs(sessionId, body),
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: qk.fullSession(vars.sessionId) });
            qc.invalidateQueries({ queryKey: qk.session(vars.sessionId) });
        },
    });
}

export function useRemoveDoc() {
    const qc = useQueryClient();
    type Vars = { sessionId: string; body: RemoveDocSessionRequest };

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.removeDoc(sessionId, body),
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: qk.fullSession(vars.sessionId) });
            qc.invalidateQueries({ queryKey: qk.session(vars.sessionId) });
        },
    });
}