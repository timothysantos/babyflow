import type { TimelineClusterDTO, TimelineClusterDraft } from '../../domain/timeline-clustering/timeline-cluster.types';
import { all, ensureRuntimeTable, exec, runtimeDb } from '../db/d1-runtime';

type TimelineClusterStore = {
  clusters: TimelineClusterDTO[];
};

const storeKey = '__babyflow_timeline_cluster_store__';
const tableName = 'timeline_clusters';
const createTableSql = `
CREATE TABLE IF NOT EXISTS timeline_clusters (
  id TEXT PRIMARY KEY,
  baby_id TEXT NOT NULL,
  routine_day_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  cluster_type TEXT NOT NULL,
  event_ids TEXT NOT NULL,
  intervention_attempt_ids TEXT NOT NULL,
  feed_session_ids TEXT NOT NULL,
  diaper_event_ids TEXT NOT NULL,
  state_transition_ids TEXT NOT NULL,
  linked_cycle_id TEXT,
  confidence_score REAL NOT NULL,
  status TEXT NOT NULL,
  reason TEXT
);
`;

function getStore(): TimelineClusterStore {
  const globalStore = globalThis as typeof globalThis & { [storeKey]?: TimelineClusterStore };
  if (!globalStore[storeKey]) {
    globalStore[storeKey] = { clusters: [] };
  }
  return globalStore[storeKey]!;
}

async function ensureTable() {
  await ensureRuntimeTable(tableName, createTableSql);
}

async function persistCluster(cluster: TimelineClusterDTO) {
  await exec(
    'INSERT OR REPLACE INTO timeline_clusters (id, baby_id, routine_day_id, started_at, ended_at, cluster_type, event_ids, intervention_attempt_ids, feed_session_ids, diaper_event_ids, state_transition_ids, linked_cycle_id, confidence_score, status, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      cluster.id,
      cluster.babyId,
      cluster.routineDayId,
      cluster.startedAt,
      cluster.endedAt ?? null,
      cluster.clusterType,
      JSON.stringify(cluster.eventIds),
      JSON.stringify(cluster.interventionAttemptIds),
      JSON.stringify(cluster.feedSessionIds),
      JSON.stringify(cluster.diaperEventIds),
      JSON.stringify(cluster.stateTransitionIds),
      cluster.linkedCycleId ?? null,
      cluster.confidenceScore,
      cluster.status,
      cluster.reason ?? null
    ]
  );
}

function rowToCluster(row: {
  id: string;
  babyId: string;
  routineDayId: string;
  startedAt: string;
  endedAt: string | null;
  clusterType: TimelineClusterDTO['clusterType'];
  eventIds: string;
  interventionAttemptIds: string;
  feedSessionIds: string;
  diaperEventIds: string;
  stateTransitionIds: string;
  linkedCycleId: string | null;
  confidenceScore: number;
  status: TimelineClusterDTO['status'];
  reason: string | null;
}): TimelineClusterDTO {
  return {
    id: row.id,
    babyId: row.babyId,
    routineDayId: row.routineDayId,
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? undefined,
    clusterType: row.clusterType,
    eventIds: JSON.parse(row.eventIds) as string[],
    interventionAttemptIds: JSON.parse(row.interventionAttemptIds) as string[],
    feedSessionIds: JSON.parse(row.feedSessionIds) as string[],
    diaperEventIds: JSON.parse(row.diaperEventIds) as string[],
    stateTransitionIds: JSON.parse(row.stateTransitionIds) as string[],
    linkedCycleId: row.linkedCycleId ?? undefined,
    confidenceScore: row.confidenceScore,
    status: row.status,
    reason: row.reason ?? undefined
  };
}

export async function replaceTimelineClusters(clusters: TimelineClusterDraft[]): Promise<TimelineClusterDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    await exec('DELETE FROM timeline_clusters');
    for (const cluster of clusters) {
      await persistCluster(cluster);
    }
    return clusters;
  }
  getStore().clusters = clusters;
  return clusters;
}

export async function listTimelineClusters(): Promise<TimelineClusterDTO[]> {
  if (runtimeDb()) {
    await ensureTable();
    const rows = await all<{
      id: string;
      babyId: string;
      routineDayId: string;
      startedAt: string;
      endedAt: string | null;
      clusterType: TimelineClusterDTO['clusterType'];
      eventIds: string;
      interventionAttemptIds: string;
      feedSessionIds: string;
      diaperEventIds: string;
      stateTransitionIds: string;
      linkedCycleId: string | null;
      confidenceScore: number;
      status: TimelineClusterDTO['status'];
      reason: string | null;
    }>('SELECT id, baby_id as babyId, routine_day_id as routineDayId, started_at as startedAt, ended_at as endedAt, cluster_type as clusterType, event_ids as eventIds, intervention_attempt_ids as interventionAttemptIds, feed_session_ids as feedSessionIds, diaper_event_ids as diaperEventIds, state_transition_ids as stateTransitionIds, linked_cycle_id as linkedCycleId, confidence_score as confidenceScore, status, reason FROM timeline_clusters ORDER BY started_at DESC');
    return rows.map(rowToCluster);
  }
  return getStore().clusters;
}

export async function resetTimelineClusterStoreForTests() {
  getStore().clusters = [];
}
