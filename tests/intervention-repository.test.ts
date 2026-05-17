import { describe, expect, it } from 'vitest';
import {
  listInterventions,
  recordIntervention,
  resetInterventionStoreForTests
} from '../src/infrastructure/repositories/intervention-repository';

describe('intervention repository', () => {
  it('stores interventions with newest first', async () => {
    await resetInterventionStoreForTests();

    const first = await recordIntervention({ babyId: 'baby_1', kind: 'WAIT', label: 'wait' });
    const second = await recordIntervention({ babyId: 'baby_1', kind: 'SOOTHE', label: 'soothe', outcome: 'FAILED' });
    const attempts = await listInterventions();

    expect(attempts[0].id).toBe(second.id);
    expect(attempts[1].id).toBe(first.id);
    expect(attempts[0]).toMatchObject({ kind: 'SOOTHE', label: 'soothe', outcome: 'FAILED' });
  });
});
