export const qk = {
    session: (sessionId: string) =>
        ['session', sessionId] as const,
    fullSession: (sessionId: string) =>
        ['session', sessionId, 'full'] as const,
    diff: (sessionId: string, arrayStrategiesHash: string) =>
        ['session', sessionId, 'diff', arrayStrategiesHash] as const,
    suggestKeys: (sessionId: string, path: string, topK: number) =>
        ['session', sessionId, 'arrays', 'suggestKeys', path, topK] as const,
    merge: (sessionId: string) =>
        ['session', sessionId, 'merge'] as const,
    exportText: (sessionId: string) =>
        ['session', sessionId, 'exportText'] as const,
};