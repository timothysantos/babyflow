import { describe, expect, it } from 'vitest';
import { recordEvent, listEvents, resetEventStoreForTests } from '../src/infrastructure/repositories/event-repository';

describe('event repository', () => {
  it('stores events with newest first', async () => {
    await resetEventStoreForTests();

    const first = await recordEvent({ kind: 'WAKE', label: 'wake' });
    const second = await recordEvent({ kind: 'FEED', label: 'feed' });
    const events = await listEvents();

    expect(events[0].id).toBe(second.id);
    expect(events[1].id).toBe(first.id);
    expect(events[0]).toMatchObject({ kind: 'FEED', label: 'feed' });
  });
});
