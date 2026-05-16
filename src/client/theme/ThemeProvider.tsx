import type { PropsWithChildren } from 'react';

export type ThemeMode = 'light' | 'night';

export function ThemeProvider({ children }: PropsWithChildren) {
  return children;
}
