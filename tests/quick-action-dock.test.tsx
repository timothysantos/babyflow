import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuickActionDock } from '../src/client/components/actions/QuickActionDock';

describe('QuickActionDock', () => {
  it('renders the core actions', () => {
    render(<QuickActionDock />);
    expect(screen.getByRole('navigation', { name: 'Quick actions' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Wake note' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy();
  });
});
