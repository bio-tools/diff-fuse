import { useApiMutation } from '../useApiMutation';
import { api } from '../../api/diffFuse';
import type { MergeRequest, MergeResponse } from '../../api/generated';

type Vars = { sessionId: string; body: MergeRequest };

export function useMerge() {
    return useApiMutation<MergeResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.merge(sessionId, body),
    });
}