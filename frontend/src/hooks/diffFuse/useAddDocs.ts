import { useApiMutation } from '../useApiMutation';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import type { AddDocsSessionRequest, SessionResponse } from '../../api/generated';

type Vars = { sessionId: string; body: AddDocsSessionRequest };

export function useAddDocs() {
    const qc = useQueryClient();

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.addDocs(sessionId, body),
        onSuccess: (data, vars) => {
            // update docs-meta cache immediately
            qc.setQueryData(qk.docsMeta(vars.sessionId), data);
            // diff tree is now stale (docs changed)
            qc.invalidateQueries({ queryKey: qk.session(vars.sessionId) });
        },
    });
}