import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { BabySelectPage } from './routes/BabySelectPage';
import { HelpPage } from './routes/HelpPage';
import { ReviewPage } from './routes/ReviewPage';
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
  },
  {
    path: '/review',
    element: <ReviewPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
