const KEY = 'diff-fuse:session-id';

export function loadSessionId(): string | null {
    return localStorage.getItem(KEY);
}

export function saveSessionId(id: string) {
    localStorage.setItem(KEY, id);
}

export function clearSessionId() {
    localStorage.removeItem(KEY);
}