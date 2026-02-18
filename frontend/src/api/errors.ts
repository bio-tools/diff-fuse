import { ApiError } from './generated';

type BackendErrorEnvelope = {
    error?: {
        message?: string;
        code?: string;
        details?: unknown;
        request_id?: string | null;
    };
};

// FastAPI / Pydantic common shapes
type FastApiValidationError = {
    detail?: Array<{
        loc?: Array<string | number>;
        msg?: string;
        type?: string;
        input?: unknown;
        ctx?: Record<string, unknown>;
    }> | string;
};

function isObject(x: unknown): x is Record<string, unknown> {
    return typeof x === 'object' && x !== null;
}

function safeStringify(x: unknown, maxLen = 2000): string {
    try {
        const s = JSON.stringify(x, null, 2);
        return s.length > maxLen ? s.slice(0, maxLen) + '\n…(truncated)…' : s;
    } catch {
        return String(x);
    }
}

function formatLoc(loc?: Array<string | number>): string {
    if (!loc?.length) return '';
    // FastAPI often has ["body","documents",0,"content"]
    // Make it more readable:
    const cleaned = loc[0] === 'body' ? loc.slice(1) : loc;
    return cleaned
        .map((p) => (typeof p === 'number' ? `[${p}]` : p))
        .join('.')
        .replace('.[', '[');
}

function formatFastApiDetail(detail: unknown): string | null {
    // detail can be a string or array of error objects
    if (typeof detail === 'string') return detail;

    if (Array.isArray(detail)) {
        const lines = detail.map((d) => {
            if (!isObject(d)) return String(d);

            const loc = formatLoc((d as any).loc);
            const msg = (d as any).msg ?? 'Validation error';
            const typ = (d as any).type ? ` (${(d as any).type})` : '';
            const input =
                'input' in d && (d as any).input !== undefined
                    ? ` | input=${safeStringify((d as any).input, 300)}`
                    : '';

            return `${loc ? `${loc}: ` : ''}${msg}${typ}${input}`;
        });

        // Don’t spam if there are tons of errors
        const max = 8;
        const shown = lines.slice(0, max);
        const more = lines.length > max ? `\n…(+${lines.length - max} more)` : '';
        return shown.join('\n') + more;
    }

    return null;
}

function summarizeApiError(err: ApiError): string {
    const status = err.status;
    const statusText = err.statusText || '';
    const url = err.url ? ` @ ${err.url}` : '';

    const body = err.body as unknown;

    // 1) Your standardized envelope (best UX)
    if (isObject(body) && 'error' in body) {
        const env = body as BackendErrorEnvelope;
        const msg = env.error?.message;
        const code = env.error?.code ? ` [${env.error.code}]` : '';
        const reqId = env.error?.request_id ? ` (request_id=${env.error.request_id})` : '';
        const details =
            env.error?.details !== undefined ? `\nDetails:\n${safeStringify(env.error.details)}` : '';

        if (msg) return `${msg}${code}${reqId}${details}`;
    }

    // 2) FastAPI validation errors
    if (isObject(body) && 'detail' in body) {
        const detail = (body as FastApiValidationError).detail;
        const formatted = formatFastApiDetail(detail);
        if (formatted) {
            return `Validation failed (${status}).\n${formatted}`;
        }
    }

    // 3) Plain string response bodies (sometimes HTML/text)
    if (typeof body === 'string') {
        const trimmed = body.trim();
        if (trimmed) return `Request failed (${status} ${statusText})${url}\n${trimmed.slice(0, 2000)}`;
    }

    // 4) Generic object body
    if (isObject(body)) {
        return `Request failed (${status} ${statusText})${url}\n${safeStringify(body)}`;
    }

    // 5) Fallback to ApiError message
    return err.message || `Request failed (${status} ${statusText})${url}`;
}

export function getErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
        return summarizeApiError(err);
    }

    if (err instanceof Error) {
        return err.message || 'Something went wrong';
    }

    // unknown non-Error throw
    if (typeof err === 'string') return err;
    if (isObject(err)) return safeStringify(err);

    return 'Something went wrong';
}