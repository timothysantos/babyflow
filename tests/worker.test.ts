import { describe, expect, it } from 'vitest';
import worker from '../src/worker';

describe('worker fetch', () => {
  it('returns the health payload at /health', async () => {
    const response = await worker.fetch(new Request('https://example.com/health'), {});
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, service: 'babyflow' });
  });
});
