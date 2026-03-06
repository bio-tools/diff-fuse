import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ScrollSyncXProvider } from "./hooks";

export default function App() {
  return (
    <ScrollSyncXProvider>
      <main className="main">
        <RouterProvider router={router} />
      </main>
    </ScrollSyncXProvider>
  );
}