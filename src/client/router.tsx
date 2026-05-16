import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div data-testid="router-root">BabyFlow router</div>
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
