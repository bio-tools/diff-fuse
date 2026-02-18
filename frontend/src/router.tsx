import React, { lazy } from 'react';
import {
    createBrowserRouter,
    isRouteErrorResponse,
    useRouteError,
} from 'react-router-dom';

const Main = lazy(() => import('./pages/Main'));

function RootLayout() {
    return (
        <React.Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <Main />
        </React.Suspense>
    );
}

function RouteError() {
    const err = useRouteError();

    let title = 'Route crashed';
    let detail = '';

    if (isRouteErrorResponse(err)) {
        title = `Route error ${err.status}`;
        detail = err.statusText || JSON.stringify(err.data);
    } else if (err instanceof Error) {
        detail = `${err.name}: ${err.message}\n\n${err.stack ?? ''}`;
    } else {
        detail = String(err);
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>{title}</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{detail}</pre>
        </div>
    );
}

export const router = createBrowserRouter([
    { path: '/', element: <RootLayout />, errorElement: <RouteError /> },
    { path: '/s/:sessionId', element: <RootLayout />, errorElement: <RouteError /> },
]);