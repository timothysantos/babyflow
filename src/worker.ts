import { healthResponse } from './infrastructure/api/routes/health';
import { babiesRoute } from './infrastructure/api/routes/babies';
import { eventsRoute } from './infrastructure/api/routes/events';
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

    if (url.pathname === '/events') {
      return eventsRoute(request);
    }

    return new Response('BabyFlow', {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    });
  }
};
