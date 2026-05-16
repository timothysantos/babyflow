import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

describe('Today header', () => {
  it('renders the bilingual title without wrapping assumptions', () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Today / 今天')).toBeTruthy();
  });
});
