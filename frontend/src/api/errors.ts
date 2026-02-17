import { ApiError } from './generated';

type BackendErrorEnvelope = {
    error?: {
        message?: string;
        code?: string;
        details?: unknown;
        request_id?: string | null;
    };
};

export function getErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
        const body = err.body as BackendErrorEnvelope | undefined;

        // Your standardized error model
        const msg = body?.error?.message;
        if (msg) return msg;

        // FastAPI validation errors (422) often come as { detail: [...] }
        if (typeof err.body === 'object' && err.body && 'detail' in err.body) {
            try {
                return JSON.stringify((err.body as any).detail);
            } catch {
                return 'Validation error';
            }
        }

        // Fallback
        return err.message || `Request failed (${err.status})`;
    }

    if (err instanceof Error) return err.message;

    return 'Something went wrong';
}