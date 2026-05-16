import { describe, expect, it } from 'vitest';
import { recordEvent, listEvents, resetEventStoreForTests } from '../src/infrastructure/repositories/event-repository';

describe('event repository', () => {
  it('stores events with newest first', async () => {
    await resetEventStoreForTests();

    const first = await recordEvent({ kind: 'WAKE', label: 'wake', babyId: 'baby_1' });
    const second = await recordEvent({ kind: 'FEED', label: 'feed', babyId: 'baby_1' });
    const third = await recordEvent({ kind: 'BURP', label: 'burp', babyId: 'baby_1' });
    const events = await listEvents();

    expect(events[0].id).toBe(third.id);
    expect(events[1].id).toBe(second.id);
    expect(events[2].id).toBe(first.id);
    expect(events[0]).toMatchObject({ kind: 'BURP', label: 'burp', babyId: 'baby_1' });
  });
});
