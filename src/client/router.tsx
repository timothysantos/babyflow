import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { BabySelectPage } from './routes/BabySelectPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BabySelectPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
