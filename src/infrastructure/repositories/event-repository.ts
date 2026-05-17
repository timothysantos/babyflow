import type { CycleEventDTO, CycleEventDraft } from '../../domain/event/event.types';
import { all, ensureRuntimeTable, exec, runtimeDb } from '../db/d1-runtime';

type EventRow = CycleEventDTO;

type EventStore = {
  events: EventRow[];
};

const storeKey = '__babyflow_event_store__';
const tableName = 'cycle_events';
const createTableSql = `
CREATE TABLE IF NOT EXISTS cycle_events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  baby_id TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);
`;

function getStore(): EventStore {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: EventStore };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = { events: [] };
  }
  return globalStore[storeKey]!;
}

function nowIso() {
  return new Date().toISOString();
}

function makeId() {
  return `event_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureTable() {
  await ensureRuntimeTable(tableName, createTableSql);
}

export async function recordEvent(draft: CycleEventDraft): Promise<CycleEventDTO> {
  const row: CycleEventDTO = {
    id: makeId(),
    kind: draft.kind,
    label: draft.label,
    babyId: draft.babyId,
    recordedAt: nowIso()
  };
  if (runtimeDb()) {
    await ensureTable();
    await exec(
      'INSERT INTO cycle_events (id, kind, label, baby_id, recorded_at) VALUES (?, ?, ?, ?, ?)',
      [row.id, row.kind, row.label, row.babyId, row.recordedAt]
    );
    return row;
  }
  getStore().events.unshift(row);
  return row;
}

export async function listEvents(): Promise<CycleEventDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<EventRow>(
      'SELECT id, kind, label, baby_id as babyId, recorded_at as recordedAt FROM cycle_events ORDER BY recorded_at DESC'
    );
    return rows;
  }
  return getStore().events;
}

export async function resetEventStoreForTests() {
  getStore().events = [];
}
