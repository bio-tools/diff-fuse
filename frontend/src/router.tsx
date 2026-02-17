import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const Main = lazy(() => import('./pages/Main'));

function RootLayout() {
    return (
        <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <Main />
        </React.Suspense>
    );
}

function RouteError() {
    return <div style={{ padding: 16 }}>Something went wrong.</div>;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        errorElement: <RouteError />,
    },
]);