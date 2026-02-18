import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '../api/diffFuse';
import type { AddDocsSessionRequest, RemoveDocSessionRequest } from '../api/generated';
import { getErrorMessage } from '../api/errors';
import { qk } from '../api/queryKeys';
import { useSessionStore } from '../state/sessionStore';
import { useNavigate } from 'react-router-dom';

export function useDocsMeta(sessionId: string | null) {
    const setSession = useSessionStore((s) => s.setSession);

    return useQuery({
        queryKey: sessionId ? qk.docsMeta(sessionId) : ['session', 'none', 'docsMeta'],
        enabled: !!sessionId,
        queryFn: async () => {
            const res = await api.docsMeta(sessionId!);
            setSession(res.session_id, res.documents_meta);
            return res;
        },
    });
}

export function useCreateSession() {
    const qc = useQueryClient();
    const setSession = useSessionStore((s) => s.setSession);
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (body: AddDocsSessionRequest) => api.createSession(body),
        onSuccess: (res) => {
            setSession(res.session_id, res.documents_meta);
            navigate(`/s/${res.session_id}`, { replace: true });
            qc.invalidateQueries(); // simple + safe early on
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}

export function useAddDocs(sessionId: string) {
    const qc = useQueryClient();
    const setSession = useSessionStore((s) => s.setSession);

    return useMutation({
        mutationFn: async (body: AddDocsSessionRequest) => api.addDocs(sessionId, body),
        onSuccess: (res) => {
            setSession(res.session_id, res.documents_meta);
            qc.invalidateQueries({ queryKey: qk.docsMeta(sessionId) });
            qc.invalidateQueries({ queryKey: ['session', sessionId, 'diff'] }); // any diff variants
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}

export function useRemoveDoc(sessionId: string) {
    const qc = useQueryClient();
    const setSession = useSessionStore((s) => s.setSession);

    return useMutation({
        mutationFn: async (body: RemoveDocSessionRequest) => api.removeDoc(sessionId, body),
        onSuccess: (res) => {
            setSession(res.session_id, res.documents_meta);
            qc.invalidateQueries({ queryKey: qk.docsMeta(sessionId) });
            qc.invalidateQueries({ queryKey: ['session', sessionId, 'diff'] });
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });
}