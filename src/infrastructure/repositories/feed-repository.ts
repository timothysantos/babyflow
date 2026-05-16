import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { FeedSegmentDTO, FeedSegmentDraft, FeedSessionDTO, FeedSessionDraft } from '../../domain/feed/feed.types';

type FeedStore = {
  sessions: FeedSessionDTO[];
};

const workerKey = process.env.VITEST_WORKER_ID ?? 'main';
const dataDir = process.env.BABYFLOW_DATA_DIR ?? join('.babyflow-data', workerKey);
const storeFile = join(dataDir, 'feed-sessions.json');

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureStore(): Promise<FeedStore> {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return JSON.parse(raw) as FeedStore;
  } catch {
    return { sessions: [] };
  }
}

async function saveStore(store: FeedStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
}

export async function createFeedSession(draft: FeedSessionDraft): Promise<FeedSessionDTO> {
  const session: FeedSessionDTO = {
    id: makeId('feed_session'),
    babyId: draft.babyId,
    mode: draft.mode,
    startedAt: nowIso(),
    segments: []
  };
  const store = await ensureStore();
  store.sessions.unshift(session);
  await saveStore(store);
  return session;
}

export async function listFeedSessions(): Promise<FeedSessionDTO[]> {
  const store = await ensureStore();
  return store.sessions;
}

export async function addFeedSegment(sessionId: string, draft: FeedSegmentDraft): Promise<FeedSessionDTO> {
  const store = await ensureStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);
  if (!session) throw new Error('Feed session not found');
  const segment: FeedSegmentDTO = {
    id: makeId('feed_segment'),
    kind: draft.kind,
    label: draft.label,
    recordedAt: nowIso()
  };
  session.segments.push(segment);
  await saveStore(store);
  return session;
}

export async function closeFeedSession(sessionId: string): Promise<FeedSessionDTO> {
  const store = await ensureStore();
  const session = store.sessions.find((entry) => entry.id === sessionId);
  if (!session) throw new Error('Feed session not found');
  session.endedAt = nowIso();
  await saveStore(store);
  return session;
}

export async function resetFeedStoreForTests() {
  await saveStore({ sessions: [] });
}
