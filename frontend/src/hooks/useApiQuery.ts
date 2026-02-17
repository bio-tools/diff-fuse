import { useQuery, type QueryKey, type UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/errors';

type UseApiQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error>,
    'queryKey' | 'queryFn'
> & {
    queryKey: QueryKey;
    queryFn: () => Promise<TData>;
    onError?: (error: Error) => void;
    toastOnError?: boolean;
};

export function useApiQuery<TData>({
    queryKey,
    queryFn,
    onError,
    toastOnError = true,
    ...options
}: UseApiQueryOptions<TData>) {
    return useQuery<TData, Error>({
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
}