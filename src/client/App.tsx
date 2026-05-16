import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query/query-client';
import { I18nProvider } from './i18n/I18nProvider';
import { ThemeProvider } from './theme/ThemeProvider';

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <main data-testid="app-shell">BabyFlow shell</main>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
