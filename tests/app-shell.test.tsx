import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/client/App';

describe('App shell', () => {
  it('renders the root shell and providers compose without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app-shell').textContent).toContain('Paper journal first');
    expect(screen.getByText('Timeline / Journal / Compact')).toBeTruthy();
  });
});
