import { useApiMutation } from '../useApiMutation';
import { api } from '../../api/diffFuse';
import { qk } from '../../api/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import type { RemoveDocSessionRequest, SessionResponse } from '../../api/generated';

type Vars = { sessionId: string; body: RemoveDocSessionRequest };

export function useRemoveDoc() {
    const qc = useQueryClient();

    return useApiMutation<SessionResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.removeDoc(sessionId, body),
        onSuccess: (data, vars) => {
            qc.setQueryData(qk.docsMeta(vars.sessionId), data);
            qc.invalidateQueries({ queryKey: qk.session(vars.sessionId) });
        },
    });
}