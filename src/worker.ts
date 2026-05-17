import { healthResponse } from './infrastructure/api/routes/health';
import { babiesRoute } from './infrastructure/api/routes/babies';
import { cycleEventsRoute } from './infrastructure/api/routes/events';
import { interventionsRoute } from './infrastructure/api/routes/interventions';
import { feedSessionsRoute } from './infrastructure/api/routes/feed-sessions';
import { timelineClustersRoute } from './infrastructure/api/routes/timeline-clusters';
import { createDbClient } from './infrastructure/db/client';

export interface Env {
  DB?: unknown;
}

export default {
  fetch(request: Request, env: Env): Response {
    const url = new URL(request.url);
    createDbClient(env.DB);

    if (url.pathname === '/health') {
      return healthResponse();
    }

    if (url.pathname === '/babies') {
      return babiesRoute(request);
    }

    if (url.pathname === '/cycle-events' || url.pathname === '/events') {
      return cycleEventsRoute(request);
    }

    if (url.pathname === '/feed-sessions') {
      return feedSessionsRoute(request);
    }

    if (url.pathname === '/interventions') {
      return interventionsRoute(request);
    }

    if (url.pathname === '/timeline-clusters') {
      return timelineClustersRoute(request);
    }

    if (url.pathname.startsWith('/feed-sessions/') && url.pathname.endsWith('/segments')) {
      const sessionId = url.pathname.split('/')[2];
      return feedSessionsRoute(request, sessionId);
    }

    if (url.pathname.startsWith('/feed-sessions/')) {
      const sessionId = url.pathname.split('/')[2];
      return feedSessionsRoute(request, sessionId);
    }

    return new Response('BabyFlow', {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    });
  }
};
