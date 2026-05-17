import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { HelpPage } from '../src/client/routes/HelpPage';
import { TodayPage } from '../src/client/routes/TodayPage';

describe('HelpPage', () => {
  it('renders the in-app guide route with the staged screenshots', () => {
    render(
      <MemoryRouter>
        <HelpPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('help-page')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Guide / 说明' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Today / 今天' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Profile / 资料' })).toBeTruthy();
    expect(screen.getByText('Stage 1')).toBeTruthy();
    expect(screen.getByText('Stage 5')).toBeTruthy();
    expect(screen.getByAltText('Top of Today')).toBeTruthy();
    expect(screen.getByAltText('Needs checking')).toBeTruthy();
    expect(screen.queryByText(/cluster/i)).toBeNull();
  });

  it('navigates to the guide from Today through the router', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/guide" element={<HelpPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Guide / 说明' }));

    await waitFor(() => expect(screen.getByTestId('help-page')).toBeTruthy());
    expect(screen.getByRole('heading', { name: 'Guide / 说明' })).toBeTruthy();
  });
});
