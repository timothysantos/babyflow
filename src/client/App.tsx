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
          <main className="app-shell panel-stack" data-testid="app-shell">
            <header className="timeline-card app-brand-bar">
              <p className="section-label">BabyFlow</p>
              <h1 className="today-title">Paper journal first</h1>
              <p className="today-subtitle">Timeline / Journal / Compact</p>
            </header>
            <AppRouter />
          </main>
        </QueryClientProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
