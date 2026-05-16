import { describe, expect, it } from 'vitest';
import { feedSessionsRoute } from '../src/infrastructure/api/routes/feed-sessions';
import { resetFeedStoreForTests } from '../src/infrastructure/repositories/feed-repository';

describe('feed sessions route', () => {
  it('creates, segments, closes, and lists feed sessions', async () => {
    await resetFeedStoreForTests();

    const postResponse = await feedSessionsRoute(
      new Request('https://example.com/feed-sessions', {
        method: 'POST',
        body: JSON.stringify({ babyId: 'baby_1', mode: 'BREAST' })
      })
    );

    const created = await postResponse.json();
    expect(created.session).toMatchObject({ babyId: 'baby_1', mode: 'BREAST' });

    const sessionId = created.session.id as string;

    const segmentResponse = await feedSessionsRoute(
      new Request(`https://example.com/feed-sessions/${sessionId}/segments`, {
        method: 'POST',
        body: JSON.stringify({ kind: 'LEFT', label: 'left' })
      }),
      sessionId
    );
    const segmented = await segmentResponse.json();
    expect(segmented.session.segments[0]).toMatchObject({ kind: 'LEFT', label: 'left' });

    const closeResponse = await feedSessionsRoute(
      new Request(`https://example.com/feed-sessions/${sessionId}`, { method: 'PATCH' }),
      sessionId
    );
    const closed = await closeResponse.json();
    expect(closed.session.endedAt).toBeTruthy();

    const getResponse = await feedSessionsRoute(new Request('https://example.com/feed-sessions'));
    const payload = await getResponse.json();
    expect(payload.sessions[0]).toMatchObject({ babyId: 'baby_1', mode: 'BREAST' });
  });
});
