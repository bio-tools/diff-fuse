import { useApiQuery } from '../api/useApiQuery';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import type { SuggestArrayKeysResponse } from '../../api/generated';

export function useSuggestArrayKeys(sessionId: string | null, path: string | null, topK = 10) {
    return useApiQuery<SuggestArrayKeysResponse>({
        queryKey: sessionId && path ? qk.suggestKeys(sessionId, path, topK) : ['suggestKeys', 'disabled'],
        queryFn: () => api.suggestKeys(sessionId!, { path: path!, top_k: topK }),
        enabled: !!sessionId && !!path,
        staleTime: 5 * 60_000,
    });
}