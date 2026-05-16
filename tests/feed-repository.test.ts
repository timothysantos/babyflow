import { describe, expect, it } from 'vitest';
import {
  addFeedSegment,
  closeFeedSession,
  createFeedSession,
  listFeedSessions,
  resetFeedStoreForTests
} from '../src/infrastructure/repositories/feed-repository';

describe('feed repository', () => {
  it('stores feed sessions with newest first and keeps segments on the session', async () => {
    await resetFeedStoreForTests();

    const first = await createFeedSession({ babyId: 'baby_1', mode: 'BREAST' });
    const second = await createFeedSession({ babyId: 'baby_1', mode: 'FORMULA' });
    await addFeedSegment(second.id, { kind: 'LEFT', label: 'left' });
    const closed = await closeFeedSession(second.id);
    const sessions = await listFeedSessions();

    expect(sessions[0].id).toBe(second.id);
    expect(sessions[1].id).toBe(first.id);
    expect(closed.endedAt).toBeTruthy();
    expect(sessions[0].segments[0]).toMatchObject({ kind: 'LEFT', label: 'left' });
  });
});
