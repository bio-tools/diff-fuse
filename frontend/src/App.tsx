import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function App() {
  return (
    <div id="root">
      <main className="main">
        <RouterProvider router={router} />
      </main>
    </div>
  );
}