import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { InterventionAttemptDTO, InterventionAttemptDraft } from '../../domain/intervention/intervention.types';

type InterventionStore = {
  interventions: InterventionAttemptDTO[];
};

const workerKey = process.env.VITEST_WORKER_ID ?? 'main';
const dataDir = process.env.BABYFLOW_DATA_DIR ?? join('.babyflow-data', workerKey);
const storeFile = join(dataDir, 'interventions.json');

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `intervention_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureStore(): Promise<InterventionStore> {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return JSON.parse(raw) as InterventionStore;
  } catch {
    return { interventions: [] };
  }
}

async function saveStore(store: InterventionStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
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
  const store = await ensureStore();
  store.interventions.unshift(row);
  await saveStore(store);
  return row;
}

export async function listInterventions(): Promise<InterventionAttemptDTO[]> {
  const store = await ensureStore();
  return store.interventions;
}

export async function resetInterventionStoreForTests() {
  await saveStore({ interventions: [] });
}
