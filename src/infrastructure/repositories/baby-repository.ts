import type { BabyDraft, BabyDTO } from '../../domain/baby/baby.types';
import { mapBabyRowToDto } from '../mappers/baby-mapper';
import type { BabyRow } from '../db/schema/babies';
import { all, ensureRuntimeTable, exec, runtimeDb } from '../db/d1-runtime';

type BabyStore = {
  babies: BabyRow[];
};

const storeKey = '__babyflow_baby_store__';
const tableName = 'babies';
const createTableSql = `
CREATE TABLE IF NOT EXISTS babies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  birth_weight_kg REAL,
  feeding_mode TEXT NOT NULL,
  timezone TEXT NOT NULL,
  preferred_language TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  selected_at TEXT
);
`;

function getStore(): BabyStore {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: BabyStore };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = { babies: [] };
  }
  return globalStore[storeKey]!;
}

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `baby_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureTable() {
  await ensureRuntimeTable(tableName, createTableSql);
}

function rowToBabyRow(row: {
  id: string;
  name: string;
  birthDate: string;
  birthWeightKg: number | null;
  feedingMode: BabyRow['feedingMode'];
  timezone: string;
  preferredLanguage: BabyRow['preferredLanguage'];
  createdAt: string;
  updatedAt: string;
  selectedAt: string | null;
}): BabyRow {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birthDate,
    birthWeightKg: row.birthWeightKg,
    feedingMode: row.feedingMode,
    timezone: row.timezone,
    preferredLanguage: row.preferredLanguage,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    selectedAt: row.selectedAt
  };
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
  if (runtimeDb()) {
    await ensureTable();
    await exec(
      'INSERT INTO babies (id, name, birth_date, birth_weight_kg, feeding_mode, timezone, preferred_language, created_at, updated_at, selected_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        row.id,
        row.name,
        row.birthDate,
        row.birthWeightKg,
        row.feedingMode,
        row.timezone,
        row.preferredLanguage,
        row.createdAt,
        row.updatedAt,
        row.selectedAt
      ]
    );
    return mapBabyRowToDto(row);
  }
  getStore().babies.push(row);
  return mapBabyRowToDto(row);
}

export async function listBabies(): Promise<BabyDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<BabyRow>(
      'SELECT id, name, birth_date as birthDate, birth_weight_kg as birthWeightKg, feeding_mode as feedingMode, timezone, preferred_language as preferredLanguage, created_at as createdAt, updated_at as updatedAt, selected_at as selectedAt FROM babies ORDER BY created_at DESC'
    );
    return rows.map(mapBabyRowToDto);
  }
  return getStore().babies.map(mapBabyRowToDto);
}

export async function selectBaby(id: string): Promise<BabyDTO> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<BabyRow>(
      'SELECT id, name, birth_date as birthDate, birth_weight_kg as birthWeightKg, feeding_mode as feedingMode, timezone, preferred_language as preferredLanguage, created_at as createdAt, updated_at as updatedAt, selected_at as selectedAt FROM babies WHERE id = ?',
      [id]
    );
    const row = rows[0];
    if (!row) throw new Error('Baby not found');
    const updatedAt = nowIso();
    const selectedAt = updatedAt;
    await exec('UPDATE babies SET selected_at = ?, updated_at = ? WHERE id = ?', [selectedAt, updatedAt, id]);
    return mapBabyRowToDto({ ...row, selectedAt, updatedAt });
  }
  const row = getStore().babies.find((baby) => baby.id === id);
  if (!row) throw new Error('Baby not found');
  row.selectedAt = nowIso();
  row.updatedAt = nowIso();
  return mapBabyRowToDto(row);
}

export async function resetBabyStoreForTests() {
  getStore().babies = [];
}
