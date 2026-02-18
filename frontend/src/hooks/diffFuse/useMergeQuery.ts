import { useApiQuery } from '../useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { stableHash } from '../../api/stableHash';
import type { DiffRequest, MergeResponse, MergeSelection } from '../../api/generated';

export function useMergeQuery(
    sessionId: string | null,
    diffReq: DiffRequest,
    selections: Record<string, MergeSelection>
) {
    const hashA = stableHash(diffReq.array_strategies ?? {});
    const hashS = stableHash(selections);

    return useApiQuery<MergeResponse>({
        queryKey: sessionId ? [...qk.merge(sessionId), hashA, hashS] : ['merge', 'disabled'],
        enabled: !!sessionId,
        queryFn: () =>
            api.merge(sessionId!, {
                diff_request: diffReq,
                selections,
            }),
        staleTime: 0,
    });
}