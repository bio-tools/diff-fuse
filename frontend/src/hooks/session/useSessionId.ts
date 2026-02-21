import * as React from 'react';
import { useParams } from 'react-router-dom';

function normalizeSessionId(x: unknown): string | null {
    if (typeof x !== 'string') return null;
    const s = x.trim();
    return s.length > 0 ? s : null;
}

/**
 * Single source of truth for "what session are we in?"
 * - Reads only from the URL (/s/:sessionId)
 * - Returns null on "/"
 * - Normalizes empty/whitespace to null
 */
export function useSessionId(): string | null {
    const { sessionId } = useParams();
    return React.useMemo(() => normalizeSessionId(sessionId), [sessionId]);
}

/**
 * Convenience helper when a component needs a boolean.
 */
export function useHasSession(): boolean {
    return useSessionId() !== null;
}