import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ScrollSyncXProvider } from './hooks';

export default function App() {
  return (
    <div id="root">
      <main className="main">
        <ScrollSyncXProvider>
          <RouterProvider router={router} />
        </ScrollSyncXProvider>
      </main>
    </div>
  );
}