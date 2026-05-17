import { buildBabyStateTransitions } from '../../../domain/baby-state/state-transition-engine';
import { listEvents } from '../../repositories/event-repository';
import { listFeedSessions } from '../../repositories/feed-repository';
import { listInterventions } from '../../repositories/intervention-repository';
import { listTimelineClusters, replaceTimelineClusters } from '../../repositories/timeline-cluster-repository';
import { buildTimelineClusters } from '../../../domain/timeline-clustering/cluster-engine';

export async function timelineClustersRoute(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const clusters = await listTimelineClusters();
    return Response.json({ clusters });
  }

  if (request.method === 'POST') {
    const events = await listEvents();
    const sessions = await listFeedSessions();
    const interventions = await listInterventions();
    const transitions = buildBabyStateTransitions(events, sessions, interventions);
    const clusters = buildTimelineClusters(events, sessions, interventions, transitions);
    await replaceTimelineClusters(clusters);
    return Response.json({ clusters });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
