import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { stableHash } from '../../api/stableHash';
import type { DiffRequest, DiffResponse } from '../../api/generated';

/**
 * Fetch the diff tree for a session and array-strategy configuration.
 *
 * The query key includes a stable hash of array strategies so strategy changes
 * naturally produce distinct cached results.
 */
export function useDiff(sessionId: string | null, diffReq: DiffRequest) {
    const hashA = stableHash(diffReq.array_strategies_by_node_id ?? {});
    return useApiQuery<DiffResponse>({
        queryKey: sessionId ? qk.diff(sessionId, hashA) : ["diff", "disabled"],
        queryFn: () => api.diff(sessionId!, diffReq),
        enabled: !!sessionId,
        staleTime: 60_000,
    });
}