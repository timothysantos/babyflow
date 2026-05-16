import { describe, expect, it } from 'vitest';
import { healthResponse } from '../src/infrastructure/api/routes/health';

describe('healthResponse', () => {
  it('returns a plain ok response', async () => {
    const response = healthResponse();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    await expect(response.text()).resolves.toBe('OK');
  });
});
