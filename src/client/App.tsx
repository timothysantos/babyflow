import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query/query-client';
import { I18nProvider } from './i18n/I18nProvider';
import { AppRouter } from './router';
import { ThemeProvider } from './theme/ThemeProvider';

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <main data-testid="app-shell">
            <header>Baby profile / 宝宝资料</header>
            <AppRouter />
          </main>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
