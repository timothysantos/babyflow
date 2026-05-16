import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BabySelectPage } from '../src/client/routes/BabySelectPage';

describe('locale persistence', () => {
  it('persists bilingual mode across rerender', () => {
    window.localStorage.clear();

    const { rerender } = render(
      <MemoryRouter>
        <BabySelectPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'bilingual' }));
    expect(window.localStorage.getItem('babyflow.locale')).toBe('bilingual');
    expect(screen.getByTestId('bilingual-label').textContent).toContain('起床时间');

    rerender(
      <MemoryRouter>
        <BabySelectPage />
      </MemoryRouter>
    );
    expect(window.localStorage.getItem('babyflow.locale')).toBe('bilingual');
  });
});
