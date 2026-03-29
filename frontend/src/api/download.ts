/**
 * Handwritten download helper for merged JSON export.
 *
 * The generated client is convenient for JSON APIs, but downloads are handled
 * here manually so we can:
 * - receive a `Blob`
 * - inspect non-2xx responses
 * - format backend/FastAPI errors consistently
 */

import { OpenAPI } from "./generated";

function safeStringify(x: unknown, maxLen = 2000): string {
    try {
        const s = JSON.stringify(x, null, 2);
        return s.length > maxLen ? s.slice(0, maxLen) + "\n…(truncated)…" : s;
    } catch {
        return String(x);
    }
}

function formatFastApiValidation(detail: any): string | null {
    if (typeof detail === "string") return detail;
    if (!Array.isArray(detail)) return null;

    const lines = detail.map((d: any) => {
        const loc = Array.isArray(d?.loc)
            ? d.loc
                  .filter((p: any, i: number) => !(i === 0 && p === "body"))
                  .map((p: any) => (typeof p === "number" ? `[${p}]` : p))
                  .join(".")
                  .replace(".[", "[")
            : "";

        const msg = d?.msg ?? "Validation error";
        const typ = d?.type ? ` (${d.type})` : "";
        const input = d?.input !== undefined ? ` | input=${safeStringify(d.input, 300)}` : "";
        return `${loc ? `${loc}: ` : ""}${msg}${typ}${input}`;
    });

    const max = 8;
    const shown = lines.slice(0, max);
    const more = lines.length > max ? `\n…(+${lines.length - max} more)` : "";
    return shown.join("\n") + more;
}

/**
 * Build a readable error message from a failed manual fetch response.
 */
function summarizeFetchError(status: number, statusText: string, body: unknown): string {
    if (body && typeof body === "object" && "error" in (body as any)) {
        const env = (body as any).error;
        const msg = env?.message ?? "Request failed";
        const code = env?.code ? ` [${env.code}]` : "";
        const reqId = env?.request_id ? ` (request_id=${env.request_id})` : "";
        const details = env?.details !== undefined ? `\nDetails:\n${safeStringify(env.details)}` : "";
        return `${msg}${code}${reqId}${details}`;
    }

    // FastAPI validation error
    if (body && typeof body === "object" && "detail" in (body as any)) {
        const formatted = formatFastApiValidation((body as any).detail);
        if (formatted) return `Validation failed (${status}).\n${formatted}`;
    }

    if (typeof body === "string") {
        const t = body.trim();
        if (t) return `Request failed (${status} ${statusText}).\n${t.slice(0, 2000)}`;
    }

    if (body && typeof body === "object") {
        return `Request failed (${status} ${statusText}).\n${safeStringify(body)}`;
    }

    return `Request failed (${status} ${statusText}).`;
}

/**
 * Download the merged JSON export as a blob.
 *
 * Throws a readable `Error` when the backend returns a non-success response.
 */
export async function downloadMergedJson(sessionId: string, body: unknown): Promise<Blob> {
    const res = await fetch(`${OpenAPI.BASE}/${sessionId}/export/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const contentType = res.headers.get("Content-Type") ?? "";
        const isJson =
            contentType.toLowerCase().includes("application/json") ||
            contentType.toLowerCase().includes("problem+json");

        let parsed: unknown = null;
        const text = await res.text();

        if (isJson) {
            try {
                parsed = JSON.parse(text);
            } catch {
                parsed = text;
            }
        } else {
            parsed = text;
        }

        throw new Error(summarizeFetchError(res.status, res.statusText, parsed));
    }

    return await res.blob();
}
