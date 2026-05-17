import { describe, expect, it } from 'vitest';
import { listTimelineClusters, replaceTimelineClusters, resetTimelineClusterStoreForTests } from '../src/infrastructure/repositories/timeline-cluster-repository';

describe('timeline cluster repository', () => {
  it('stores clusters newest-first as a derived set', async () => {
    await resetTimelineClusterStoreForTests();

    await replaceTimelineClusters([
      {
        id: 'cluster_1',
        babyId: 'baby_1',
        routineDayId: '2026-05-16',
        startedAt: '2026-05-16T00:00:00.000Z',
        endedAt: '2026-05-16T00:30:00.000Z',
        clusterType: 'RECOVERY_REGULATION_EPISODE',
        eventIds: ['event_1'],
        interventionAttemptIds: [],
        feedSessionIds: [],
        diaperEventIds: [],
        stateTransitionIds: [],
        confidenceScore: 0.9,
        needsReview: false,
        status: 'COMPLETE'
      },
      {
        id: 'cluster_2',
        babyId: 'baby_1',
        routineDayId: '2026-05-16',
        startedAt: '2026-05-16T01:00:00.000Z',
        endedAt: '2026-05-16T01:30:00.000Z',
        clusterType: 'EARLY_WAKE_EPISODE',
        eventIds: ['event_2'],
        interventionAttemptIds: [],
        feedSessionIds: [],
        diaperEventIds: [],
        stateTransitionIds: [],
        confidenceScore: 0.8,
        needsReview: true,
        status: 'NEEDS_REVIEW'
      }
    ]);

    const clusters = await listTimelineClusters();
    expect(clusters).toHaveLength(2);
  });
});
