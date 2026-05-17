export type TimelineClusterType =
  | 'RECOVERY_REGULATION_EPISODE'
  | 'EARLY_WAKE_EPISODE'
  | 'INTERRUPTED_FEED_EPISODE'
  | 'FEED_ONLY_EPISODE'
  | 'SETTLING_EPISODE'
  | 'UNCERTAIN';

export type TimelineClusterStatus = 'COMPLETE' | 'NEEDS_REVIEW';

export type TimelineClusterDTO = {
  id: string;
  babyId: string;
  routineDayId: string;
  startedAt: string;
  endedAt?: string;
  clusterType: TimelineClusterType;
  eventIds: string[];
  interventionAttemptIds: string[];
  feedSessionIds: string[];
  diaperEventIds: string[];
  stateTransitionIds: string[];
  linkedCycleId?: string;
  confidenceScore: number;
  needsReview: boolean;
  status: TimelineClusterStatus;
  reason?: string;
};

export type TimelineClusterDraft = TimelineClusterDTO;
