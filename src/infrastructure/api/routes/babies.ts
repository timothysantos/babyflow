import { calculateAgeWeek, validateBabyDraft, type BabyDraft } from '../../../domain/baby/baby.types';
import { createBaby, listBabies, selectBaby } from '../../repositories/baby-repository';

export async function babiesRoute(request: Request): Promise<Response> {
  if (request.method === 'GET') {
    const babies = await listBabies();
    return Response.json({ babies });
  }

  if (request.method === 'POST') {
    const body = (await request.json()) as BabyDraft;
    const validated = validateBabyDraft(body);
    const baby = await createBaby(validated);
    return Response.json({ baby });
  }

  if (request.method === 'PATCH') {
    const body = (await request.json()) as { id: string };
    const baby = await selectBaby(body.id);
    return Response.json({ baby });
  }

  return new Response('Method Not Allowed', { status: 405 });
}

export function ageWeekFromBirthDate(birthDate: string, today: string) {
  return calculateAgeWeek(birthDate, today);
}
