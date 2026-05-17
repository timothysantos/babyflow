import { describe, expect, it } from 'vitest';
import { buildBabyStateTransitions } from '../src/domain/baby-state/state-transition-engine';
import type { CycleEventDTO } from '../src/domain/event/event.types';
import type { FeedSessionDTO } from '../src/domain/feed/feed.types';

describe('state transition engine', () => {
  it('derives crying to feeding, then drowsy to asleep during a feed', () => {
    const events: CycleEventDTO[] = [
      { id: 'event_cry', kind: 'CRY', label: 'cry', babyId: 'baby_1', recordedAt: '2026-05-16T00:00:00.000Z' },
      { id: 'event_sleep', kind: 'SLEEP_OBSERVED', label: 'sleep observed', babyId: 'baby_1', recordedAt: '2026-05-16T00:10:00.000Z' }
    ];
    const sessions: FeedSessionDTO[] = [
      {
        id: 'feed_session_1',
        babyId: 'baby_1',
        mode: 'BREAST',
        startedAt: '2026-05-16T00:05:00.000Z',
        segments: []
      }
    ];

    const transitions = buildBabyStateTransitions(events, sessions);

    expect(transitions.map((transition) => `${transition.fromState}→${transition.toState}`)).toEqual([
      'AWAKE_CALM→CRYING',
      'CRYING→FEEDING',
      'FEEDING→DROWSY',
      'DROWSY→ASLEEP'
    ]);
    expect(transitions[0].confidence).toBe('CONFIRMED');
    expect(transitions[1].confidence).toBe('CONFIRMED');
    expect(transitions[2].confidence).toBe('LIKELY');
    expect(transitions[3].confidence).toBe('CONFIRMED');
  });

  it('treats sleep observed as confirmed sleep when no feed is active', () => {
    const transitions = buildBabyStateTransitions([
      { id: 'event_sleep', kind: 'SLEEP_OBSERVED', label: 'sleep observed', babyId: 'baby_1', recordedAt: '2026-05-16T00:00:00.000Z' }
    ], []);

    expect(transitions).toHaveLength(1);
    expect(transitions[0]).toMatchObject({
      fromState: 'AWAKE_CALM',
      toState: 'ASLEEP',
      confidence: 'CONFIRMED'
    });
  });
});
