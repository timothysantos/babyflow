import { describe, expect, it } from 'vitest';
import { interventionsRoute } from '../src/infrastructure/api/routes/interventions';
import { resetInterventionStoreForTests } from '../src/infrastructure/repositories/intervention-repository';

describe('interventions route', () => {
  it('creates and lists intervention attempts', async () => {
    await resetInterventionStoreForTests();

    const postResponse = await interventionsRoute(
      new Request('http://localhost/interventions', {
        method: 'POST',
        body: JSON.stringify({ babyId: 'baby_1', kind: 'WAKE_ATTEMPT', label: 'wake attempt', outcome: 'SUCCESS' }),
        headers: { 'content-type': 'application/json' }
      })
    );
    expect(postResponse.status).toBe(200);
    const posted = (await postResponse.json()) as { intervention: { kind: string; label: string; outcome: string } };
    expect(posted.intervention).toMatchObject({ kind: 'WAKE_ATTEMPT', label: 'wake attempt', outcome: 'SUCCESS' });

    const listResponse = await interventionsRoute(new Request('http://localhost/interventions'));
    expect(listResponse.status).toBe(200);
    const listed = (await listResponse.json()) as { interventions: Array<{ kind: string }> };
    expect(listed.interventions[0].kind).toBe('WAKE_ATTEMPT');
  });

  it('preserves intervention outcomes in newest-first order', async () => {
    await resetInterventionStoreForTests();

    await interventionsRoute(
      new Request('http://localhost/interventions', {
        method: 'POST',
        body: JSON.stringify({ babyId: 'baby_1', kind: 'WAIT', label: 'wait', outcome: 'FAILED' }),
        headers: { 'content-type': 'application/json' }
      })
    );
    await interventionsRoute(
      new Request('http://localhost/interventions', {
        method: 'POST',
        body: JSON.stringify({ babyId: 'baby_1', kind: 'SOOTHE', label: 'soothe', outcome: 'SUCCESS' }),
        headers: { 'content-type': 'application/json' }
      })
    );

    const listResponse = await interventionsRoute(new Request('http://localhost/interventions'));
    const listed = (await listResponse.json()) as {
      interventions: Array<{ kind: string; outcome: string }>;
    };

    expect(listed.interventions[0]).toMatchObject({ kind: 'SOOTHE', outcome: 'SUCCESS' });
    expect(listed.interventions[1]).toMatchObject({ kind: 'WAIT', outcome: 'FAILED' });
  });
});
