import type { InterventionAttemptDraft } from '../../../domain/intervention/intervention.types';
import { listInterventions, recordIntervention } from '../../repositories/intervention-repository';

export async function interventionsRoute(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const interventions = await listInterventions();
    return Response.json({ interventions });
  }

  if (request.method === 'POST') {
    const body = (await request.json()) as InterventionAttemptDraft;
    const intervention = await recordIntervention(body);
    return Response.json({ intervention });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
