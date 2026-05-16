import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { BabySelectPage } from './routes/BabySelectPage';
import { TodayPage } from './routes/TodayPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TodayPage />
  },
  {
    path: '/profile',
    element: <BabySelectPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
