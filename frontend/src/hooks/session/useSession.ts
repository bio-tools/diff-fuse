import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import type { FullSessionResponse } from '../../api/generated';

/**
 * Fetch the full backend session state for the active route session.
 */
export function useFullSession(sessionId: string | null) {
    return useApiQuery<FullSessionResponse>({
        queryKey: sessionId ? qk.fullSession(sessionId) : ['session', 'disabled'],
        enabled: !!sessionId,
        queryFn: () => api.fullSession(sessionId!),
        staleTime: 10_000,
    });
}