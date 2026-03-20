import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import type { SuggestArrayKeysResponse } from '../../api/generated';

/**
 * Fetch suggested identifier keys for an array node.
 */
export function useSuggestArrayKeys(sessionId: string | null, nodeId: string | null, topK = 10) {
    return useApiQuery<SuggestArrayKeysResponse>({
        queryKey: sessionId && nodeId ? qk.suggestKeys(sessionId, nodeId, topK) : ['suggestKeys', 'disabled'],
        queryFn: () => api.suggestKeys(sessionId!, { node_id: nodeId!, top_k: topK }),
        enabled: !!sessionId && !!nodeId,
        staleTime: 5 * 60_000,
    });
}