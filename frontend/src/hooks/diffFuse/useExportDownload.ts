import { useApiMutation } from '../api/useApiMutation';
import { downloadMergedJson } from '../../api/download';

type Vars = { sessionId: string; body: unknown };

export function useExportDownload() {
    return useApiMutation<Blob, Vars>({
        mutationFn: ({ sessionId, body }) => downloadMergedJson(sessionId, body),
    });
}