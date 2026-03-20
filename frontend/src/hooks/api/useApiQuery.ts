/**
 * Thin React Query wrapper with consistent frontend error handling.
 *
 * Extra behavior compared to raw `useQuery`
 * ----------------------------------------
 * - normalizes thrown values into `Error`
 * - shows toast notifications by default
 * - suppresses toasts for cancelled/aborted requests
 * - reintroduces a lightweight `onSuccess` pattern for React Query v5
 */

import { useEffect, useRef } from 'react';
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/errors';
import { stableHash } from "../../api/stableHash";
import { CancelError } from '../../api/generated';

/**
 * Application-level wrapper around `useQuery`.
 *
 * Notes
 * -----
 * React Query v5 removed `onSuccess` from query options. This hook recreates
 * that behavior with an effect so existing callers can stay ergonomic.
 */
type UseApiQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error>,
    'queryKey' | 'queryFn'
> & {
    queryKey: QueryKey;
    queryFn: () => Promise<TData>;
    onError?: (error: Error) => void;

    /**
     * React Query v5 removed onSuccess from query options.
     * We implement it ourselves via an effect.
     */
    onSuccess?: (data: TData) => void;

    /**
     * If true, onSuccess runs only once per hook instance (first success).
     * Default: false (runs on every successful fetch/refetch).
     */
    onSuccessOnce?: boolean;

    toastOnError?: boolean;
};

export function useApiQuery<TData>({
    queryKey,
    queryFn,
    onError,
    onSuccess,
    onSuccessOnce = false,
    toastOnError = true,
    ...options
}: UseApiQueryOptions<TData>) {
    const ranSuccessRef = useRef(false);

    const query = useQuery<TData, Error>({
        queryKey,
        queryFn: async () => {
            try {
                return await queryFn();
            } catch (e) {
                // Ignore request cancellations (navigation, unmounts, etc.)
                // Cancellation is expected during navigation/unmount; do not toast it.
                if (e instanceof CancelError) {
                    throw e; // let react-query mark it as error if it wants, but no toast
                }

                // Also ignore native AbortError (fetch)
                if (e instanceof Error && e.name === 'AbortError') {
                    throw e;
                }

                const error = e instanceof Error ? e : new Error(getErrorMessage(e));
                if (toastOnError) toast.error(getErrorMessage(error));
                onError?.(error);
                throw error;
            }
        },
        ...options,
    });

    // v5-compatible "onSuccess"
    useEffect(() => {
        if (!onSuccess) return;
        if (!query.isSuccess) return;

        if (onSuccessOnce) {
            if (ranSuccessRef.current) return;
            ranSuccessRef.current = true;
        }

        onSuccess(query.data);
    }, [onSuccess, onSuccessOnce, query.isSuccess, query.data]);

    // Reset the one-shot success guard when the semantic query identity changes.
    const keyHash = stableHash(queryKey);

    useEffect(() => {
        ranSuccessRef.current = false;
    }, [keyHash]);

    return query;
}