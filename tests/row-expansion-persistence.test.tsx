import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

describe('row expansion persistence', () => {
  it('persists expanded cycle row across rerender', () => {
    window.localStorage.clear();

    const { rerender } = render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show details' }));
    expect(screen.getByTestId('cycle-row-expanded-details')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.cycleRowExpanded')).toBe('true');

    rerender(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('cycle-row-expanded-details')).toBeTruthy();
  });
});
