import {
    useMutation,
    type UseMutationOptions,
    type MutationFunction,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/errors';

export type UseApiMutationOptions<TData, TVariables, TContext = unknown> =
    Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn' | 'onError'> & {
        mutationFn: MutationFunction<TData, TVariables>; // keep this
        onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
        toastOnError?: boolean;
    };

export function useApiMutation<TData, TVariables, TContext = unknown>({
    mutationFn,
    onError,
    toastOnError = true,
    ...options
}: UseApiMutationOptions<TData, TVariables, TContext>) {
    return useMutation<TData, Error, TVariables, TContext>({
        mutationFn: async (vars, _ctx) => {
            return await mutationFn(vars, _ctx);
        },

        onError: (e, vars, ctx) => {
            const error = e instanceof Error ? e : new Error(getErrorMessage(e));
            if (toastOnError) toast.error(getErrorMessage(error));
            onError?.(error, vars, ctx);
        },

        ...options,
    });
}