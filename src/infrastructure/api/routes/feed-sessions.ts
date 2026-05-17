import type { FeedSegmentDraft, FeedSessionDraft } from '../../../domain/feed/feed.types';
import {
  addFeedSegment,
  closeFeedSession,
  createFeedSession,
  importFeedSessionDuration,
  listFeedSessions
} from '../../repositories/feed-repository';

export async function feedSessionsRoute(request: Request, sessionId?: string): Promise<Response> {
  if (request.method === 'GET') {
    const sessions = await listFeedSessions();
    return Response.json({ sessions });
  }

  if (request.method === 'POST' && !sessionId) {
    const body = (await request.json()) as FeedSessionDraft;
    const session = await createFeedSession(body);
    return Response.json({ session });
  }

  if (request.method === 'POST' && sessionId && request.url.endsWith('/segments')) {
    const body = (await request.json()) as FeedSegmentDraft;
    const session = await addFeedSegment(sessionId, body);
    return Response.json({ session });
  }

  if (request.method === 'PATCH' && sessionId) {
    const body = (await request.json().catch(() => ({}))) as { durationMinutes?: number };
    const session =
      typeof body.durationMinutes === 'number'
        ? await importFeedSessionDuration(sessionId, body.durationMinutes)
        : await closeFeedSession(sessionId);
    return Response.json({ session });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
