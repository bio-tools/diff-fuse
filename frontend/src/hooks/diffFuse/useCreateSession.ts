import { useApiMutation } from '../useApiMutation';
import { api } from '../../api/diffFuse';
import type { AddDocsSessionRequest, SessionResponse } from '../../api/generated';

export function useCreateSession() {
    return useApiMutation<SessionResponse, AddDocsSessionRequest>({
        mutationFn: (body) => api.createSession(body),
    });
}