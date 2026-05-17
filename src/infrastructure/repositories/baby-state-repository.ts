import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BabyStateTransitionDTO, BabyStateTransitionDraft } from '../../domain/baby-state/baby-state.types';

type BabyStateStore = {
  transitions: BabyStateTransitionDTO[];
};

const workerKey = process.env.VITEST_WORKER_ID ?? 'main';
const dataDir = process.env.BABYFLOW_DATA_DIR ?? join('.babyflow-data', workerKey);
const storeFile = join(dataDir, 'baby-state-transitions.json');

function makeId(draft: BabyStateTransitionDraft) {
  return `${draft.sourceType}:${draft.sourceId}:${draft.fromState}->${draft.toState}:${draft.recordedAt}`;
}

async function ensureStore(): Promise<BabyStateStore> {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return JSON.parse(raw) as BabyStateStore;
  } catch {
    return { transitions: [] };
  }
}

async function saveStore(store: BabyStateStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
}

export async function recordBabyStateTransition(draft: BabyStateTransitionDraft): Promise<BabyStateTransitionDTO> {
  const row: BabyStateTransitionDTO = {
    id: makeId(draft),
    ...draft
  };
  const store = await ensureStore();
  store.transitions.unshift(row);
  await saveStore(store);
  return row;
}

export async function replaceBabyStateTransitions(drafts: BabyStateTransitionDraft[]): Promise<BabyStateTransitionDTO[]> {
  const rows: BabyStateTransitionDTO[] = drafts.map((draft) => ({
    id: makeId(draft),
    ...draft
  }));
  await saveStore({ transitions: rows });
  return rows;
}

export async function listBabyStateTransitions(): Promise<BabyStateTransitionDTO[]> {
  const store = await ensureStore();
  return store.transitions;
}

export async function resetBabyStateTransitionStoreForTests() {
  await saveStore({ transitions: [] });
}
