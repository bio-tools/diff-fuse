export const qk = {
    fullSession: (sessionId: string) =>
        ["session", sessionId, "full"] as const,

    diff: (sessionId: string, arrayStrategiesHash: string) =>
        ["session", sessionId, "diff", arrayStrategiesHash] as const,

    merge: (sessionId: string, arrayStrategiesHash: string, selectionsHash: string) =>
        ["session", sessionId, "merge", arrayStrategiesHash, selectionsHash] as const,

    suggestKeys: (sessionId: string, path: string, topK: number) =>
        ["session", sessionId, "arrays", "suggestKeys", path, topK] as const,
} as const;