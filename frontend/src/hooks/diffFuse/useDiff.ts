import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { stableHash } from '../../api/stableHash';
import type { DiffRequest, DiffResponse } from '../../api/generated';

export function useDiff(sessionId: string | null, diffReq: DiffRequest) {
    const hash = stableHash(diffReq.array_strategies ?? {});
    return useApiQuery<DiffResponse>({
        queryKey: sessionId ? qk.diff(sessionId, hash) : ['diff', 'disabled'],
        queryFn: () => api.diff(sessionId!, diffReq),
        enabled: !!sessionId,
        // this can be big; avoid refetching too eagerly
        staleTime: 60_000,
    });
}