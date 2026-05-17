import { listBabyStateTransitions, recordBabyStateTransition } from '../../repositories/baby-state-repository';
import type { BabyStateTransitionDraft } from '../../../domain/baby-state/baby-state.types';

export async function babyStateTransitionsRoute(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const transitions = await listBabyStateTransitions();
    return Response.json({ transitions });
  }

  if (request.method === 'POST') {
    const body = (await request.json()) as BabyStateTransitionDraft;
    const transition = await recordBabyStateTransition(body);
    return Response.json({ transition });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
