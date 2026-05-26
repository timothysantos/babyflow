import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuickActionDock } from '../src/client/components/actions/QuickActionDock';

describe('QuickActionDock', () => {
  it('renders the core actions', () => {
    render(<QuickActionDock onAction={() => undefined} />);
    expect(screen.getByRole('navigation', { name: 'Add to timeline' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Wake' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Left feed' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Right feed' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Formula' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sleep' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Note' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy();
  });
});
