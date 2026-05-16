import type { BabyDraft, BabyDTO } from '../../domain/baby/baby.types';
import { mapBabyRowToDto } from '../mappers/baby-mapper';
import type { BabyRow } from '../db/schema/babies';

const store = new Map<string, BabyRow>();

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `baby_${Math.random().toString(36).slice(2, 10)}`;
}

export async function createBaby(draft: BabyDraft): Promise<BabyDTO> {
  const id = makeId();
  const timestamp = nowIso();
  const row: BabyRow = {
    id,
    name: draft.name,
    birthDate: draft.birthDate,
    birthWeightKg: draft.birthWeightKg ?? null,
    feedingMode: draft.feedingMode ?? 'BREAST',
    timezone: draft.timezone,
    preferredLanguage: draft.preferredLanguage ?? 'en',
    createdAt: timestamp,
    updatedAt: timestamp,
    selectedAt: null
  };
  store.set(id, row);
  return mapBabyRowToDto(row);
}

export async function listBabies(): Promise<BabyDTO[]> {
  return Array.from(store.values()).map(mapBabyRowToDto);
}

export async function selectBaby(id: string): Promise<BabyDTO> {
  const row = store.get(id);
  if (!row) throw new Error('Baby not found');
  row.selectedAt = nowIso();
  row.updatedAt = nowIso();
  store.set(id, row);
  return mapBabyRowToDto(row);
}
