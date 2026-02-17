import { useMutation, type UseMutationOptions, type MutationFunction } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/errors';

export type UseApiMutationOptions<TData, TVariables, TContext = unknown> =
    Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn' | 'onError'> & {
        mutationFn: MutationFunction<TData, TVariables>;
        onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
    };

export function useApiMutation<TData, TVariables, TContext = unknown>({
    mutationFn,
    onError,
    ...options
}: UseApiMutationOptions<TData, TVariables, TContext>) {
    return useMutation<TData, Error, TVariables, TContext>({
        mutationFn: async (vars) => mutationFn(vars),
        onError: (error, vars, ctx) => {
            toast.error(`Action failed: ${getErrorMessage(error)}`);
            onError?.(error, vars, ctx);
        },
        ...options,
    });
}