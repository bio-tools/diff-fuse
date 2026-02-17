import { OpenAPI } from './generated';

export async function downloadMergedJson(sessionId: string, body: unknown): Promise<Blob> {
    const res = await fetch(`${OpenAPI.BASE}/${sessionId}/export/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        // try to surface backend error message if available
        const text = await res.text();
        throw new Error(text || `Download failed (${res.status})`);
    }
    return await res.blob();
}