import { useApiQuery } from '../useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import type { SessionResponse } from '../../api/generated';

export function useDocsMeta(sessionId: string | null) {
    return useApiQuery<SessionResponse>({
        queryKey: sessionId ? qk.docsMeta(sessionId) : ['docsMeta', 'disabled'],
        queryFn: () => api.docsMeta(sessionId!),
        enabled: !!sessionId,
        staleTime: 30_000,
    });
}