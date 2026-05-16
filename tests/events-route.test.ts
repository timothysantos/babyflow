import { describe, expect, it } from 'vitest';
import { eventsRoute } from '../src/infrastructure/api/routes/events';
import { resetEventStoreForTests } from '../src/infrastructure/repositories/event-repository';

describe('events route', () => {
  it('creates and lists cycle events without leaking store internals', async () => {
    await resetEventStoreForTests();
    const postResponse = await eventsRoute(
      new Request('https://example.com/events', {
        method: 'POST',
        body: JSON.stringify({ kind: 'WAKE', label: 'wake', babyId: 'baby_1' })
      })
    );

    const created = await postResponse.json();
    expect(created).toHaveProperty('event');
    expect(created.event).toMatchObject({ kind: 'WAKE', label: 'wake', babyId: 'baby_1' });

    const getResponse = await eventsRoute(new Request('https://example.com/events'));
    const payload = await getResponse.json();
    expect(payload).toHaveProperty('events');
    expect(payload.events[0]).toMatchObject({ kind: 'WAKE', label: 'wake', babyId: 'baby_1' });
  });
});
