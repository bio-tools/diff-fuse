import { api } from "../../api/diffFuse";
import type { FullSessionResponse } from "../../api/generated";
import { qk } from "../../api/queryKeys";
import { useApiQuery } from "../api/useApiQuery";

/**
 * Fetch the full backend session state for the active route session.
 */
export function useFullSession(sessionId: string | null) {
    return useApiQuery<FullSessionResponse>({
        queryKey: sessionId ? qk.fullSession(sessionId) : ["session", "disabled"],
        enabled: !!sessionId,
        queryFn: () => api.fullSession(sessionId!),
        staleTime: 10_000,
    });
}
