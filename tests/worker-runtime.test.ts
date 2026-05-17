// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';

describe('worker runtime routes', () => {
  const workerUrl = process.env.TEST_WORKER_URL ?? 'http://127.0.0.1:8788';
  const body = (value: unknown) => JSON.stringify(value);
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const babyId = `baby_${runId}`;

  beforeAll(async () => {
    const health = await request(workerUrl, '/health');
    if (health.statusCode !== 200) {
      throw new Error(
        `Test worker is not running at ${workerUrl}. Start \`npm run dev:test:api\` or \`npm run dev:test\` first.`
      );
    }
  });

  it('serves real worker routes backed by the local D1 runtime', async () => {
    const health = await request(workerUrl, '/health');
    expect(health.statusCode).toBe(200);
    expect(health.body).toBe('OK');

    const eventResponse = await request(workerUrl, '/cycle-events', {
      method: 'POST',
      body: body({ kind: 'WAKE', label: 'wake', babyId })
    });
    expect(eventResponse.statusCode).toBeGreaterThanOrEqual(200);
    expect(eventResponse.statusCode).toBeLessThan(300);
    expect(JSON.parse(eventResponse.body)).toHaveProperty('event');

    const feedResponse = await request(workerUrl, '/feed-sessions', {
      method: 'POST',
      body: body({ babyId, mode: 'BREAST' })
    });
    expect(feedResponse.statusCode).toBeGreaterThanOrEqual(200);
    expect(feedResponse.statusCode).toBeLessThan(300);
    expect(JSON.parse(feedResponse.body)).toHaveProperty('session');

    const interventionsResponse = await request(workerUrl, '/interventions', {
      method: 'POST',
      body: body({ babyId, kind: 'SOOTHE', label: 'soothe', outcome: 'SUCCESS' })
    });
    expect(interventionsResponse.statusCode).toBeGreaterThanOrEqual(200);
    expect(interventionsResponse.statusCode).toBeLessThan(300);
    expect(JSON.parse(interventionsResponse.body)).toHaveProperty('intervention');

    const babyCreateResponse = await request(workerUrl, '/babies', {
      method: 'POST',
      body: body({
        name: `Mika ${runId}`,
        birthDate: '2026-05-01',
        timezone: 'Asia/Singapore',
        preferredLanguage: 'bilingual'
      })
    });
    expect(babyCreateResponse.statusCode).toBeGreaterThanOrEqual(200);
    expect(babyCreateResponse.statusCode).toBeLessThan(300);
    expect(JSON.parse(babyCreateResponse.body)).toHaveProperty('baby');

    const babyStateResponse = await request(workerUrl, '/baby-state-transitions', {
      method: 'POST',
      body: body({
        babyId,
        fromState: 'AWAKE_CALM',
        toState: 'CRYING',
        confidence: 'CONFIRMED',
        recordedAt: `2026-05-16T00:00:${String(Math.floor(Math.random() * 50)).padStart(2, '0')}.000Z`,
        sourceType: 'cycle-event',
        sourceId: `event_${runId}`,
        triggerLabel: 'cry',
        triggerKind: 'CRY'
      })
    });
    expect(babyStateResponse.statusCode).toBeGreaterThanOrEqual(200);
    expect(babyStateResponse.statusCode).toBeLessThan(300);
    expect(JSON.parse(babyStateResponse.body)).toHaveProperty('transition');
  });
});

function request(
  baseUrl: string,
  pathname: string,
  options: { method?: string; body?: string } = {}
) {
  return new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
    const url = new URL(pathname, baseUrl);
    const req = http.request(
      url,
      {
        method: options.method ?? 'GET',
        headers: options.body ? { 'content-type': 'application/json' } : undefined
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString('utf8')
          });
        });
      }
    );

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}
