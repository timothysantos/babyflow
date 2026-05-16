import { describe, expect, it } from 'vitest';
import { calculateAgeWeek, validateBabyDraft } from '../src/domain/baby/baby.types';

describe('baby domain', () => {
  it('requires birthDate and timezone', () => {
    expect(() => validateBabyDraft({ name: 'A', birthDate: '', timezone: 'Asia/Singapore' })).toThrow('birthDate is required');
    expect(() => validateBabyDraft({ name: 'A', birthDate: '2026-05-01', timezone: '' })).toThrow('timezone is required');
  });

  it('calculates age week from birthDate', () => {
    expect(calculateAgeWeek('2026-05-01', '2026-05-16')).toBe(2);
  });
});
