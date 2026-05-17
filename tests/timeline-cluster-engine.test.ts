import { describe, expect, it } from 'vitest';
import { buildTimelineClusters } from '../src/domain/timeline-clustering/cluster-engine';
import type { CycleEventDTO } from '../src/domain/event/event.types';
import type { FeedSessionDTO } from '../src/domain/feed/feed.types';
import type { InterventionAttemptDTO } from '../src/domain/intervention/intervention.types';
import type { BabyStateTransitionDTO } from '../src/domain/baby-state/baby-state.types';

describe('timeline cluster engine', () => {
  it('keeps an interrupted feed scenario in one cluster', () => {
    const events: CycleEventDTO[] = [
      { id: 'event_cry', kind: 'CRY', label: 'cry', babyId: 'baby_1', recordedAt: '2026-05-16T06:30:00.000Z' },
      { id: 'event_sleep', kind: 'SLEEP_OBSERVED', label: 'sleep observed', babyId: 'baby_1', recordedAt: '2026-05-16T07:32:00.000Z' }
    ];
    const sessions: FeedSessionDTO[] = [
      {
        id: 'feed_session_1',
        babyId: 'baby_1',
        mode: 'BREAST',
        startedAt: '2026-05-16T06:35:00.000Z',
        endedAt: '2026-05-16T07:16:00.000Z',
        segments: [
          { id: 'segment_1', kind: 'RIGHT', label: 'right', recordedAt: '2026-05-16T06:35:00.000Z' },
          { id: 'segment_2', kind: 'LEFT', label: 'left', recordedAt: '2026-05-16T06:55:00.000Z' }
        ]
      }
    ];
    const interventions: InterventionAttemptDTO[] = [
      {
        id: 'intervention_1',
        babyId: 'baby_1',
        kind: 'WAKE_ATTEMPT',
        label: 'wake attempt',
        outcome: 'FAILED',
        context: 'today',
        recordedAt: '2026-05-16T07:01:00.000Z'
      }
    ];
    const transitions: BabyStateTransitionDTO[] = [];

    const clusters = buildTimelineClusters(events, sessions, interventions, transitions);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({
      clusterType: 'INTERRUPTED_FEED_EPISODE',
      status: 'COMPLETE',
      needsReview: false
    });
    expect(clusters[0].eventIds).toContain('event_cry');
    expect(clusters[0].feedSessionIds).toContain('feed_session_1');
    expect(clusters[0].interventionAttemptIds).toContain('intervention_1');
  });

  it('labels an early wake scenario as an early wake cluster', () => {
    const events: CycleEventDTO[] = [
      { id: 'event_wake', kind: 'WAKE', label: 'wake', babyId: 'baby_1', recordedAt: '2026-05-16T11:34:00.000Z' },
      { id: 'event_sleep', kind: 'SLEEP_OBSERVED', label: 'sleep observed', babyId: 'baby_1', recordedAt: '2026-05-16T12:40:00.000Z' }
    ];
    const sessions: FeedSessionDTO[] = [
      {
        id: 'feed_session_1',
        babyId: 'baby_1',
        mode: 'BREAST',
        startedAt: '2026-05-16T11:40:00.000Z',
        endedAt: '2026-05-16T12:25:00.000Z',
        segments: [
          { id: 'segment_1', kind: 'RIGHT', label: 'right', recordedAt: '2026-05-16T11:40:00.000Z' },
          { id: 'segment_2', kind: 'LEFT', label: 'left', recordedAt: '2026-05-16T12:00:00.000Z' }
        ]
      }
    ];
    const interventions: InterventionAttemptDTO[] = [
      {
        id: 'intervention_1',
        babyId: 'baby_1',
        kind: 'SOOTHE',
        label: 'soothe',
        outcome: 'FAILED',
        context: 'today',
        recordedAt: '2026-05-16T11:35:00.000Z'
      }
    ];

    const clusters = buildTimelineClusters(events, sessions, interventions, []);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toMatchObject({
      clusterType: 'EARLY_WAKE_EPISODE',
      status: 'COMPLETE',
      needsReview: false
    });
    expect(clusters[0].reason).toContain('early wake');
  });

  it('keeps a previous sleep boundary cluster grouped with bath and play activity', () => {
    const events: CycleEventDTO[] = [
      { id: 'event_cry', kind: 'CRY', label: 'cry', babyId: 'baby_1', recordedAt: '2026-05-16T09:28:00.000Z' },
      { id: 'event_play', kind: 'PLAY', label: 'play', babyId: 'baby_1', recordedAt: '2026-05-16T10:25:00.000Z' },
      { id: 'event_sleep', kind: 'SLEEP_OBSERVED', label: 'sleep observed', babyId: 'baby_1', recordedAt: '2026-05-16T10:52:00.000Z' }
    ];
    const sessions: FeedSessionDTO[] = [
      {
        id: 'feed_session_1',
        babyId: 'baby_1',
        mode: 'BREAST',
        startedAt: '2026-05-16T09:30:00.000Z',
        endedAt: '2026-05-16T10:20:00.000Z',
        segments: [
          { id: 'segment_1', kind: 'RIGHT', label: 'right', recordedAt: '2026-05-16T09:30:00.000Z' },
          { id: 'segment_2', kind: 'LEFT', label: 'left', recordedAt: '2026-05-16T09:50:00.000Z' }
        ]
      }
    ];
    const interventions: InterventionAttemptDTO[] = [
      {
        id: 'intervention_1',
        babyId: 'baby_1',
        kind: 'BURP',
        label: 'burp',
        outcome: 'SUCCESS',
        context: 'today',
        recordedAt: '2026-05-16T10:20:00.000Z'
      }
    ];

    const clusters = buildTimelineClusters(events, sessions, interventions, []);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].clusterType).toBe('RECOVERY_REGULATION_EPISODE');
    expect(clusters[0].needsReview).toBe(false);
  });

  it('marks an ambiguous cluster as needing review', () => {
    const events: CycleEventDTO[] = [
      { id: 'event_note', kind: 'NOTE', label: 'note', babyId: 'baby_1', recordedAt: '2026-05-16T09:00:00.000Z' }
    ];

    const clusters = buildTimelineClusters(events, [], [], []);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].status).toBe('NEEDS_REVIEW');
    expect(clusters[0].clusterType).toBe('UNCERTAIN');
  });
});
