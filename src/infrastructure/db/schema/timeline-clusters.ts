export const timelineClustersSchema = `
CREATE TABLE timeline_clusters (
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
