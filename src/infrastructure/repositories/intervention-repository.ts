import type { InterventionAttemptDTO, InterventionAttemptDraft } from '../../domain/intervention/intervention.types';
import { all, ensureRuntimeTable, exec, runtimeDb } from '../db/d1-runtime';

type InterventionStore = {
  interventions: InterventionAttemptDTO[];
};

const storeKey = '__babyflow_intervention_store__';
const tableName = 'interventions';
const createTableSql = `
CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  outcome TEXT NOT NULL,
  context TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);
`;

function getStore(): InterventionStore {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: InterventionStore };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = { interventions: [] };
  }
  return globalStore[storeKey]!;
}

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `intervention_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureTable() {
  await ensureRuntimeTable(tableName, createTableSql);
}

export async function recordIntervention(draft: InterventionAttemptDraft): Promise<InterventionAttemptDTO> {
  const row: InterventionAttemptDTO = {
    id: makeId(),
    babyId: draft.babyId,
    kind: draft.kind,
    label: draft.label,
    outcome: draft.outcome ?? 'UNKNOWN',
    context: draft.context ?? '',
    recordedAt: nowIso()
  };
  if (runtimeDb()) {
    await ensureTable();
    await exec(
      'INSERT INTO interventions (id, baby_id, kind, label, outcome, context, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [row.id, row.babyId, row.kind, row.label, row.outcome, row.context, row.recordedAt]
    );
    return row;
  }
  getStore().interventions.unshift(row);
  return row;
}

export async function listInterventions(): Promise<InterventionAttemptDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<InterventionAttemptDTO>(
      'SELECT id, baby_id as babyId, kind, label, outcome, context, recorded_at as recordedAt FROM interventions ORDER BY recorded_at DESC'
    );
    return rows;
  }
  return getStore().interventions;
}

export async function resetInterventionStoreForTests() {
  getStore().interventions = [];
}
