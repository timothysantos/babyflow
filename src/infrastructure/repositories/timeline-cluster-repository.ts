import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { TimelineClusterDTO, TimelineClusterDraft } from '../../domain/timeline-clustering/timeline-cluster.types';

type TimelineClusterStore = {
  clusters: TimelineClusterDTO[];
};

const workerKey = process.env.VITEST_WORKER_ID ?? 'main';
const dataDir = process.env.BABYFLOW_DATA_DIR ?? join('.babyflow-data', workerKey);
const storeFile = join(dataDir, 'timeline-clusters.json');

async function ensureStore(): Promise<TimelineClusterStore> {
  try {
    const raw = await readFile(storeFile, 'utf8');
    return JSON.parse(raw) as TimelineClusterStore;
  } catch {
    return { clusters: [] };
  }
}

async function saveStore(store: TimelineClusterStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storeFile, JSON.stringify(store, null, 2), 'utf8');
}

export async function replaceTimelineClusters(clusters: TimelineClusterDraft[]): Promise<TimelineClusterDTO[]> {
  const store = { clusters };
  await saveStore(store);
  return clusters;
}

export async function listTimelineClusters(): Promise<TimelineClusterDTO[]> {
  const store = await ensureStore();
  return store.clusters;
}

export async function resetTimelineClusterStoreForTests() {
  await saveStore({ clusters: [] });
}
