import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { BabySelectPage } from './routes/BabySelectPage';
import { HelpPage } from './routes/HelpPage';
import { TodayPage } from './routes/TodayPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TodayPage />
  },
  {
    path: '/profile',
    element: <BabySelectPage />
  },
  {
    path: '/guide',
    element: <HelpPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
