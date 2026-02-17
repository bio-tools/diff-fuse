export function stableHash(obj: unknown): string {
    // For now stable JSON stringify
    return JSON.stringify(obj, Object.keys(obj as any).sort());
}