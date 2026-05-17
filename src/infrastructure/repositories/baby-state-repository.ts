import type { BabyStateTransitionDTO, BabyStateTransitionDraft } from '../../domain/baby-state/baby-state.types';
import { all, ensureRuntimeTable, exec, runtimeDb } from '../db/d1-runtime';

type BabyStateStore = {
  transitions: BabyStateTransitionDTO[];
};

const storeKey = '__babyflow_baby_state_store__';
const tableName = 'baby_state_transitions';
const createTableSql = `
CREATE TABLE IF NOT EXISTS baby_state_transitions (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  confidence TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  reason TEXT
);
`;

function getStore(): BabyStateStore {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: BabyStateStore };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = { transitions: [] };
  }
  return globalStore[storeKey]!;
}

function makeId(draft: BabyStateTransitionDraft) {
  return `${draft.sourceType}:${draft.sourceId}:${draft.fromState}->${draft.toState}:${draft.recordedAt}`;
}

async function ensureTable() {
  await ensureRuntimeTable(tableName, createTableSql);
}

export async function recordBabyStateTransition(draft: BabyStateTransitionDraft): Promise<BabyStateTransitionDTO> {
  const row: BabyStateTransitionDTO = {
    id: makeId(draft),
    ...draft
  };
  if (runtimeDb()) {
    await ensureTable();
    await exec(
      'INSERT INTO baby_state_transitions (id, source_type, source_id, from_state, to_state, confidence, recorded_at, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [row.id, row.sourceType, row.sourceId, row.fromState, row.toState, row.confidence, row.recordedAt, row.reason ?? null]
    );
    return row;
  }
  getStore().transitions.unshift(row);
  return row;
}

export async function replaceBabyStateTransitions(drafts: BabyStateTransitionDraft[]): Promise<BabyStateTransitionDTO[]> {
  const rows: BabyStateTransitionDTO[] = drafts.map((draft) => ({
    id: makeId(draft),
    ...draft
  }));
  if (runtimeDb()) {
    await ensureTable();
    await exec('DELETE FROM baby_state_transitions');
    for (const row of rows) {
      await exec(
        'INSERT INTO baby_state_transitions (id, source_type, source_id, from_state, to_state, confidence, recorded_at, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [row.id, row.sourceType, row.sourceId, row.fromState, row.toState, row.confidence, row.recordedAt, row.reason ?? null]
      );
    }
    return rows;
  }
  getStore().transitions = rows;
  return rows;
}

export async function listBabyStateTransitions(): Promise<BabyStateTransitionDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<BabyStateTransitionDTO>(
      'SELECT id, source_type as sourceType, source_id as sourceId, from_state as fromState, to_state as toState, confidence, recorded_at as recordedAt, reason FROM baby_state_transitions ORDER BY recorded_at DESC'
    );
    return rows;
  }
  return getStore().transitions;
}

export async function resetBabyStateTransitionStoreForTests() {
  getStore().transitions = [];
}
