import { useApiMutation } from '../api/useApiMutation';
import { api } from '../../api/diffFuse';
import type { ExportRequest, ExportTextResponse } from '../../api/generated';

type Vars = { sessionId: string; body: ExportRequest };

export function useExportText() {
    return useApiMutation<ExportTextResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.exportText(sessionId, body),
    });
}