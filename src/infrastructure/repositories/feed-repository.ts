import type {
  FeedSegmentDTO,
  FeedSegmentDraft,
  FeedSessionDTO,
  FeedSessionDraft
} from '../../domain/feed/feed.types';
import { all, ensureRuntimeColumns, ensureRuntimeTable, exec, runtimeDb } from '../db/d1-runtime';

type FeedStore = {
  sessions: FeedSessionDTO[];
};

const storeKey = '__babyflow_feed_store__';
const tableName = 'feed_sessions';
const createTableSql = `
CREATE TABLE IF NOT EXISTS feed_sessions (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER,
  duration_source TEXT,
  segments_json TEXT NOT NULL
);
`;

function getStore(): FeedStore {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: FeedStore };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = { sessions: [] };
  }
  return globalStore[storeKey]!;
}

function nowIso() {
  return new Date().toISOString();
}

function minutesBetween(startedAt: string, endedAt: string) {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return undefined;
  }
  return Math.max(0, Math.round((end - start) / 60000));
}

function addMinutes(startedAt: string, durationMinutes: number) {
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return nowIso();
  return new Date(start + Math.max(0, durationMinutes) * 60000).toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureTable() {
  await ensureRuntimeTable(tableName, createTableSql);
  await ensureRuntimeColumns(tableName, [
    { name: 'duration_minutes', ddl: 'INTEGER' },
    { name: 'duration_source', ddl: 'TEXT' }
  ]);
}

function rowToSession(row: {
  id: string;
  babyId: string;
  mode: FeedSessionDTO['mode'];
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  durationSource: FeedSessionDTO['durationSource'] | null;
  segmentsJson: string;
}): FeedSessionDTO {
  return {
    id: row.id,
    babyId: row.babyId,
    mode: row.mode,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? undefined,
    durationMinutes: row.durationMinutes ?? undefined,
    durationSource: row.durationSource ?? undefined,
    segments: JSON.parse(row.segmentsJson) as FeedSegmentDTO[]
  };
}

async function persistSession(session: FeedSessionDTO) {
  await exec(
    'UPDATE feed_sessions SET baby_id = ?, mode = ?, started_at = ?, ended_at = ?, duration_minutes = ?, duration_source = ?, segments_json = ? WHERE id = ?',
    [
      session.babyId,
      session.mode,
      session.startedAt,
      session.endedAt ?? null,
      session.durationMinutes ?? null,
      session.durationSource ?? null,
      JSON.stringify(session.segments),
      session.id
    ]
  );
}

async function setSessionDuration(sessionId: string, durationMinutes: number) {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<{
      id: string;
      babyId: string;
      mode: FeedSessionDTO['mode'];
      startedAt: string;
      endedAt: string | null;
      durationMinutes: number | null;
      durationSource: FeedSessionDTO['durationSource'] | null;
      segmentsJson: string;
    }>(
      'SELECT id, baby_id as babyId, mode, started_at as startedAt, ended_at as endedAt, duration_minutes as durationMinutes, duration_source as durationSource, segments_json as segmentsJson FROM feed_sessions WHERE id = ?',
      [sessionId]
    );
    const session = rows[0];
    if (!session) throw new Error('Feed session not found');
    const sessionDto = rowToSession(session);
    sessionDto.durationMinutes = durationMinutes;
    sessionDto.durationSource = 'MANUAL';
    sessionDto.endedAt = addMinutes(sessionDto.startedAt, durationMinutes);
    await persistSession(sessionDto);
    return sessionDto;
  }

  const session = getStore().sessions.find((entry) => entry.id === sessionId);
  if (!session) throw new Error('Feed session not found');
  session.durationMinutes = durationMinutes;
  session.durationSource = 'MANUAL';
  session.endedAt = addMinutes(session.startedAt, durationMinutes);
  return session;
}

export async function createFeedSession(draft: FeedSessionDraft): Promise<FeedSessionDTO> {
  const session: FeedSessionDTO = {
    id: makeId('feed_session'),
    babyId: draft.babyId,
    mode: draft.mode,
    startedAt: nowIso(),
    segments: []
  };
  if (runtimeDb()) {
    await ensureTable();
    await exec(
      'INSERT INTO feed_sessions (id, baby_id, mode, started_at, ended_at, duration_minutes, duration_source, segments_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [session.id, session.babyId, session.mode, session.startedAt, null, null, null, '[]']
    );
    return session;
  }
  getStore().sessions.unshift(session);
  return session;
}

export async function listFeedSessions(): Promise<FeedSessionDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<{
      id: string;
      babyId: string;
      mode: FeedSessionDTO['mode'];
      startedAt: string;
      endedAt: string | null;
      durationMinutes: number | null;
      durationSource: FeedSessionDTO['durationSource'] | null;
      segmentsJson: string;
    }>(
      'SELECT id, baby_id as babyId, mode, started_at as startedAt, ended_at as endedAt, duration_minutes as durationMinutes, duration_source as durationSource, segments_json as segmentsJson FROM feed_sessions ORDER BY started_at DESC'
    );
    return rows.map(rowToSession);
  }
  return getStore().sessions;
}

export async function addFeedSegment(sessionId: string, draft: FeedSegmentDraft): Promise<FeedSessionDTO> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<{
      id: string;
      babyId: string;
      mode: FeedSessionDTO['mode'];
      startedAt: string;
      endedAt: string | null;
      durationMinutes: number | null;
      durationSource: FeedSessionDTO['durationSource'] | null;
      segmentsJson: string;
    }>(
      'SELECT id, baby_id as babyId, mode, started_at as startedAt, ended_at as endedAt, duration_minutes as durationMinutes, duration_source as durationSource, segments_json as segmentsJson FROM feed_sessions WHERE id = ?',
      [sessionId]
    );
    const session = rows[0];
    if (!session) throw new Error('Feed session not found');
    const sessionDto = rowToSession(session);
    const segment: FeedSegmentDTO = {
      id: makeId('feed_segment'),
      kind: draft.kind,
      label: draft.label,
      recordedAt: nowIso()
    };
    sessionDto.segments.push(segment);
    await persistSession(sessionDto);
    return sessionDto;
  }
  const store = getStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);
  if (!session) throw new Error('Feed session not found');
  const segment: FeedSegmentDTO = {
    id: makeId('feed_segment'),
    kind: draft.kind,
    label: draft.label,
    recordedAt: nowIso()
  };
  session.segments.push(segment);
  return session;
}

export async function closeFeedSession(sessionId: string): Promise<FeedSessionDTO> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<{
      id: string;
      babyId: string;
      mode: FeedSessionDTO['mode'];
      startedAt: string;
      endedAt: string | null;
      durationMinutes: number | null;
      durationSource: FeedSessionDTO['durationSource'] | null;
      segmentsJson: string;
    }>(
      'SELECT id, baby_id as babyId, mode, started_at as startedAt, ended_at as endedAt, duration_minutes as durationMinutes, duration_source as durationSource, segments_json as segmentsJson FROM feed_sessions WHERE id = ?',
      [sessionId]
    );
    const session = rows[0];
    if (!session) throw new Error('Feed session not found');
    const sessionDto = rowToSession(session);
    sessionDto.endedAt = nowIso();
    sessionDto.durationMinutes = sessionDto.durationMinutes ?? minutesBetween(sessionDto.startedAt, sessionDto.endedAt) ?? undefined;
    sessionDto.durationSource = sessionDto.durationSource ?? 'LIVE';
    await persistSession(sessionDto);
    return sessionDto;
  }
  const session = getStore().sessions.find((entry) => entry.id === sessionId);
  if (!session) throw new Error('Feed session not found');
  session.endedAt = nowIso();
  session.durationMinutes = session.durationMinutes ?? minutesBetween(session.startedAt, session.endedAt) ?? undefined;
  session.durationSource = session.durationSource ?? 'LIVE';
  return session;
}

export async function importFeedSessionDuration(sessionId: string, durationMinutes: number) {
  return setSessionDuration(sessionId, Math.max(0, Math.round(durationMinutes)));
}

export async function resetFeedStoreForTests() {
  getStore().sessions = [];
}
