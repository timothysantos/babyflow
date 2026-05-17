import { describe, expect, it } from 'vitest';
import {
  addFeedSegment,
  closeFeedSession,
  createFeedSession,
  importFeedSessionDuration,
  listFeedSessions,
  resetFeedStoreForTests
} from '../src/infrastructure/repositories/feed-repository';

describe('feed repository', () => {
  it('stores feed sessions with newest first and keeps segments in append order on the session', async () => {
    await resetFeedStoreForTests();

    const first = await createFeedSession({ babyId: 'baby_1', mode: 'BREAST' });
    const second = await createFeedSession({ babyId: 'baby_1', mode: 'FORMULA' });
    await addFeedSegment(second.id, { kind: 'LEFT', label: 'left' });
    await addFeedSegment(second.id, { kind: 'RIGHT', label: 'right' });
    const closed = await closeFeedSession(second.id);
    const sessions = await listFeedSessions();

    expect(sessions[0].id).toBe(second.id);
    expect(sessions[1].id).toBe(first.id);
    expect(closed.endedAt).toBeTruthy();
    expect(sessions[0].segments[0]).toMatchObject({ kind: 'LEFT', label: 'left' });
    expect(sessions[0].segments[1]).toMatchObject({ kind: 'RIGHT', label: 'right' });
  });

  it('imports a manual duration and preserves it when the session closes', async () => {
    await resetFeedStoreForTests();

    const session = await createFeedSession({ babyId: 'baby_1', mode: 'BREAST' });
    const imported = await importFeedSessionDuration(session.id, 18);
    expect(imported.durationMinutes).toBe(18);
    expect(imported.durationSource).toBe('MANUAL');

    const closed = await closeFeedSession(session.id);
    expect(closed.durationMinutes).toBe(18);
    expect(closed.durationSource).toBe('MANUAL');
  });
});
