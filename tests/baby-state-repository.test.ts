import { describe, expect, it } from 'vitest';
import {
  listBabyStateTransitions,
  recordBabyStateTransition,
  resetBabyStateTransitionStoreForTests
} from '../src/infrastructure/repositories/baby-state-repository';

describe('baby state repository', () => {
  it('stores state transitions newest-first', async () => {
    await resetBabyStateTransitionStoreForTests();

    const first = await recordBabyStateTransition({
      babyId: 'baby_1',
      fromState: 'AWAKE_CALM',
      toState: 'CRYING',
      confidence: 'CONFIRMED',
      recordedAt: '2026-05-16T00:00:00.000Z',
      sourceType: 'cycle-event',
      sourceId: 'event_1',
      triggerLabel: 'cry',
      triggerKind: 'CRY'
    });
    const second = await recordBabyStateTransition({
      babyId: 'baby_1',
      fromState: 'CRYING',
      toState: 'FEEDING',
      confidence: 'CONFIRMED',
      recordedAt: '2026-05-16T00:05:00.000Z',
      sourceType: 'feed-session',
      sourceId: 'feed_session_1',
      triggerLabel: 'breast feed',
      triggerKind: 'FEED_START'
    });

    const transitions = await listBabyStateTransitions();
    expect(transitions[0].id).toBe(second.id);
    expect(transitions[1].id).toBe(first.id);
  });
});
