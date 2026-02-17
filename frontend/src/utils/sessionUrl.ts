const KEY = 'session';

export function getSessionIdFromUrl(): string | null {
    const url = new URL(window.location.href);
    return url.searchParams.get(KEY);
}

export function setSessionIdInUrl(sessionId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(KEY, sessionId);
    window.history.replaceState({}, '', url.toString());
}

export function clearSessionIdInUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete(KEY);
    window.history.replaceState({}, '', url.toString());
}