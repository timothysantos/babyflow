import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { TodayPage } from './routes/TodayPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TodayPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
