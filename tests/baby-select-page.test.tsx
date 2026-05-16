import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BabySelectPage } from '../src/client/routes/BabySelectPage';

describe('BabySelectPage', () => {
  it('renders bilingual labels and computes age week after create', async () => {
    render(<BabySelectPage />);

    expect(screen.getByText('Baby profile / 宝宝资料')).toBeTruthy();
    expect(screen.getByTestId('bilingual-label').textContent).toBe('Wake up time');

    fireEvent.click(screen.getByRole('button', { name: 'bilingual' }));
    expect(screen.getByTestId('bilingual-label').textContent).toBe('Wake up time / 起床时间');

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Mika' } });
    fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2026-05-01' } });
    fireEvent.change(screen.getByLabelText('Timezone'), { target: { value: 'Asia/Singapore' } });
    fireEvent.submit(screen.getByText('Create baby').closest('form')!);

    await waitFor(() => expect(screen.getByTestId('selected-baby').textContent).toContain('Mika'));
    expect(screen.getByTestId('age-week').textContent).toContain('2');
  });
});
