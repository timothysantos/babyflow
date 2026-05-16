import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from '../src/client/theme/ThemeProvider';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: matches && query.includes('prefers-color-scheme: light'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false
    })
  });
}

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('follows machine light mode by default and still toggles', () => {
    mockMatchMedia(true);

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-value').textContent).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByTestId('theme-value').textContent).toBe('night');
    expect(document.documentElement.dataset.theme).toBe('night');
  });
});
