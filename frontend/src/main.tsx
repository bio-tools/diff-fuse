import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './index.css'
import App from './App.tsx'
import { configureApi } from './api/client';

configureApi();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,               // don’t DDoS your own API
      refetchOnWindowFocus: false,
      staleTime: 5_000,       // small default; tune later
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster richColors />
    </QueryClientProvider>
  </StrictMode>
);