import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { stableHash } from '../../api/stableHash';
import type {
    DiffRequest,
    MergeResponse,
} from '../../api/generated';
import type { MergeSelection } from '../../utils/mergeSelection';

/**
 * Fetch the live merged preview for a session.
 *
 * The query key includes both:
 * - array strategy hash
 * - selection hash
 *
 * so any effective merge decision change produces a new query identity.
 */
export function useMergeQuery(
    sessionId: string | null,
    diffReq: DiffRequest,
    selections: Record<string, MergeSelection>
) {
    const hashA = stableHash(diffReq.array_strategies_by_node_id ?? {});
    const hashS = stableHash(selections);

    return useApiQuery<MergeResponse>({
        queryKey: sessionId ? qk.merge(sessionId, hashA, hashS) : ["merge", "disabled"],
        enabled: !!sessionId,
        queryFn: () =>
            api.merge(sessionId!, {
                diff_request: diffReq,
                selections_by_node_id: selections,
            }),
        staleTime: 0,
    });
}