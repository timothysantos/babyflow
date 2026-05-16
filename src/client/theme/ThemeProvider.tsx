import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type ThemeMode = 'light' | 'night';

type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ThemeMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'night';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'night';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>(systemTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const updateTheme = () => {
      setTheme(mediaQuery.matches ? 'light' : 'night');
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }

    mediaQuery.addListener(updateTheme);
    return () => mediaQuery.removeListener(updateTheme);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === 'night' ? 'light' : 'night'))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
