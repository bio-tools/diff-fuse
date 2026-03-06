import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return (
    <main className="main">
      <RouterProvider router={router} />
    </main>
  );
}