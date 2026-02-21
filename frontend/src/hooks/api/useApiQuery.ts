import { useEffect, useRef } from 'react';
import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/errors';

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
                // openapi client returns CancelablePromise, which is thenable, so await works fine
                return await queryFn();
            } catch (e) {
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

    // reset "once" guard if the queryKey changes
    useEffect(() => {
        ranSuccessRef.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(queryKey)]);

    return query;
}