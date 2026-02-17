import { useApiMutation } from './useApiMutation';
import { useApiQuery } from './useApiQuery';
import { api } from '../api/diffFuse';
import { saveSessionId } from '../state/session';

export function useCreateSession() {
    return useApiMutation({
        mutationFn: api.createSession,
        onSuccess: (res) => saveSessionId(res.session_id),
    });
}

export function useDocsMeta(sessionId: string | null) {
    return useApiQuery({
        queryKey: ['docs-meta', sessionId],
        enabled: !!sessionId,
        queryFn: () => api.docsMeta(sessionId!),
    });
}