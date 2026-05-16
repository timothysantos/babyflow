import type { BabyDraft, BabyDTO } from '../../domain/baby/baby.types';
import { mapBabyRowToDto } from '../mappers/baby-mapper';
import type { BabyRow } from '../db/schema/babies';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type BabyStore = {
  babies: BabyRow[];
};

const workerKey = process.env.VITEST_WORKER_ID ?? 'main';
const dataDir = process.env.BABYFLOW_DATA_DIR ?? join('.babyflow-data', workerKey);
const storeFile = join(dataDir, 'babies.json');

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `baby_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureStore(): Promise<BabyStore> {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return JSON.parse(raw) as BabyStore;
  } catch {
    return { babies: [] };
  }
}

async function saveStore(store: BabyStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
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
  const store = await ensureStore();
  store.babies.push(row);
  await saveStore(store);
  return mapBabyRowToDto(row);
}

export async function listBabies(): Promise<BabyDTO[]> {
  const store = await ensureStore();
  return store.babies.map(mapBabyRowToDto);
}

export async function selectBaby(id: string): Promise<BabyDTO> {
  const store = await ensureStore();
  const row = store.babies.find((baby) => baby.id === id);
  if (!row) throw new Error('Baby not found');
  row.selectedAt = nowIso();
  row.updatedAt = nowIso();
  await saveStore(store);
  return mapBabyRowToDto(row);
}

export async function resetBabyStoreForTests() {
  await saveStore({ babies: [] });
}
