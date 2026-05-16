import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

describe('TodayPage', () => {
  it('renders mobile layout, expandable row, and quick action dock', () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mobile-shell')).toBeTruthy();
    expect(screen.getByTestId('today-page')).toBeTruthy();
    expect(screen.getByTestId('compact-mode')).toBeTruthy();
    expect(screen.getByText('Compact mode scaffolded.')).toBeTruthy();
    expect(screen.getByTestId('quick-action-dock')).toBeTruthy();
    expect(screen.getByTestId('cycle-row-scroll')).toBeTruthy();
    expect(screen.getByTestId('cycle-row-scroll').scrollWidth).toBeGreaterThanOrEqual(
      screen.getByTestId('cycle-row-scroll').clientWidth
    );

    fireEvent.click(screen.getByRole('button', { name: 'Compact mode off' }));
    expect(screen.getByText('Compact mode active.')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.compactMode')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Show details' }));
    expect(screen.getByTestId('cycle-row-expanded-details')).toBeTruthy();
  });
});
