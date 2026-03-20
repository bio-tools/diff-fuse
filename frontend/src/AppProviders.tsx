import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ScrollSyncXProvider } from "./hooks";
import { configureApi } from "./api/client";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5_000,
        },
        mutations: { retry: 0 },
    },
});

configureApi();

/**
 * Root application providers.
 *
 * This is the single place where cross-cutting runtime concerns are wired:
 * - React Query
 * - scroll-sync context
 * - global toast notifications
 * - API base configuration
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ScrollSyncXProvider>
                {children}
                <Toaster richColors />
            </ScrollSyncXProvider>
        </QueryClientProvider>
    );
}