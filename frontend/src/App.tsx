import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ScrollSyncXProvider } from './hooks';

export default function App() {
  return (
    <div id="root">
      <div id="ui-portal">
        <main className="main">
          <ScrollSyncXProvider>
            <RouterProvider router={router} />
          </ScrollSyncXProvider>
        </main>
      </div>
    </div>
  );
}