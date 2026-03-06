import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { stableHash } from '../../api/stableHash';
import type { DiffRequest, DiffResponse } from '../../api/generated';

export function useDiff(sessionId: string | null, diffReq: DiffRequest) {
    const hashA = stableHash(diffReq.array_strategies ?? {});
    return useApiQuery<DiffResponse>({
        queryKey: sessionId ? qk.diff(sessionId, hashA) : ["diff", "disabled"],
        queryFn: () => api.diff(sessionId!, diffReq),
        enabled: !!sessionId,
        staleTime: 60_000,
    });
}