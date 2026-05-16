import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LanguageToggle } from '../src/client/components/i18n/LanguageToggle';

describe('bilingual render', () => {
  it('renders bilingual labels in bilingual mode', () => {
    render(<LanguageToggle value="bilingual" onChange={() => {}} />);

    expect(screen.getByRole('group', { name: 'Language / 语言' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'bilingual' })).toBeTruthy();
  });
});
