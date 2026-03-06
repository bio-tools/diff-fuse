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