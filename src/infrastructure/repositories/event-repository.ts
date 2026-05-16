import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { EventDTO, EventDraft } from '../../domain/event/event.types';

type EventRow = EventDTO;

type EventStore = {
  events: EventRow[];
};

const workerKey = process.env.VITEST_WORKER_ID ?? 'main';
const dataDir = process.env.BABYFLOW_DATA_DIR ?? join('.babyflow-data', workerKey);
const storeFile = join(dataDir, 'events.json');

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `event_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureStore(): Promise<EventStore> {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return JSON.parse(raw) as EventStore;
  } catch {
    return { events: [] };
  }
}

async function saveStore(store: EventStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
}

export async function recordEvent(draft: EventDraft): Promise<EventDTO> {
  const row: EventDTO = {
    id: makeId(),
    kind: draft.kind,
    label: draft.label,
    recordedAt: nowIso()
  };
  const store = await ensureStore();
  store.events.unshift(row);
  await saveStore(store);
  return row;
}

export async function listEvents(): Promise<EventDTO[]> {
  const store = await ensureStore();
  return store.events;
}

export async function resetEventStoreForTests() {
  await saveStore({ events: [] });
}
