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
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByTestId('row-details')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.rowDetailsOpen')).toBe('true');

    rerender(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('row-details')).toBeTruthy();
  });
});
