import { healthResponse } from './infrastructure/api/routes/health';
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

    return new Response('BabyFlow', {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8'
      }
    });
  }
};
