import { describe, expect, it } from 'vitest';
import { babiesRoute } from '../src/infrastructure/api/routes/babies';
import { createBaby } from '../src/infrastructure/repositories/baby-repository';

describe('babies route', () => {
  it('returns BabyDTO only after create', async () => {
    const response = await babiesRoute(
      new Request('https://example.com/babies', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Mika',
          birthDate: '2026-05-01',
          timezone: 'Asia/Singapore',
          preferredLanguage: 'bilingual'
        })
      })
    );

    const payload = await response.json();
    expect(payload).toHaveProperty('baby');
    expect(payload.baby).toMatchObject({
      name: 'Mika',
      birthDate: '2026-05-01',
      timezone: 'Asia/Singapore',
      preferredLanguage: 'bilingual'
    });
    expect(payload.baby).not.toHaveProperty('selectedAt');
  });
});
