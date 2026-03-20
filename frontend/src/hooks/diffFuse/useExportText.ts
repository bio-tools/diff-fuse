import { api } from "../../api/diffFuse";
import type { ExportRequest, ExportTextResponse } from "../../api/generated";
import { useApiMutation } from "../api/useApiMutation";

type Vars = { sessionId: string; body: ExportRequest };

/**
 * Export the current merged result as text.
 */
export function useExportText() {
    return useApiMutation<ExportTextResponse, Vars>({
        mutationFn: ({ sessionId, body }) => api.exportText(sessionId, body),
    });
}
