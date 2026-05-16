import type { CycleEventDraft } from '../../../domain/event/event.types';
import { listEvents, recordEvent } from '../../repositories/event-repository';

export async function cycleEventsRoute(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const events = await listEvents();
    return Response.json({ events });
  }

  if (request.method === 'POST') {
    const body = (await request.json()) as CycleEventDraft;
    const event = await recordEvent(body);
    return Response.json({ event });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

export const eventsRoute = cycleEventsRoute;
