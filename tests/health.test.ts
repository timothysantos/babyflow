import { describe, expect, it } from 'vitest';
import { healthResponse } from '../src/infrastructure/api/routes/health';

describe('healthResponse', () => {
  it('returns a json ok response', async () => {
    const response = healthResponse();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true, service: 'babyflow' });
  });
});
