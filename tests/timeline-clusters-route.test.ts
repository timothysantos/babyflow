import { describe, expect, it } from 'vitest';
import { timelineClustersRoute } from '../src/infrastructure/api/routes/timeline-clusters';
import { addFeedSegment, closeFeedSession, createFeedSession, resetFeedStoreForTests } from '../src/infrastructure/repositories/feed-repository';
import { recordEvent, resetEventStoreForTests } from '../src/infrastructure/repositories/event-repository';
import { recordIntervention, resetInterventionStoreForTests } from '../src/infrastructure/repositories/intervention-repository';
import { resetTimelineClusterStoreForTests } from '../src/infrastructure/repositories/timeline-cluster-repository';

describe('timeline clusters route', () => {
  it('rebuilds clusters from the current source stores', async () => {
    await resetEventStoreForTests();
    await resetFeedStoreForTests();
    await resetInterventionStoreForTests();
    await resetTimelineClusterStoreForTests();

    await recordEvent({ kind: 'CRY', label: 'cry', babyId: 'baby_1' });
    const feedSession = await createFeedSession({ babyId: 'baby_1', mode: 'BREAST' });
    await addFeedSegment(feedSession.id, { kind: 'RIGHT', label: 'right' });
    await closeFeedSession(feedSession.id);
    await recordIntervention({ babyId: 'baby_1', kind: 'SOOTHE', label: 'soothe', outcome: 'FAILED', context: 'today' });

    const rebuildResponse = await timelineClustersRoute(new Request('http://localhost/timeline-clusters', { method: 'POST' }));
    expect(rebuildResponse.status).toBe(200);

    const body = (await rebuildResponse.json()) as { clusters: Array<{ clusterType: string; status: string; needsReview: boolean }> };
    expect(body.clusters).toHaveLength(1);
    expect(body.clusters[0]).toMatchObject({
      clusterType: 'INTERRUPTED_FEED_EPISODE',
      status: 'COMPLETE',
      needsReview: false
    });
  });
});
