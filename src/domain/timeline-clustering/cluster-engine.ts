import type { BabyStateTransitionDTO } from '../baby-state/baby-state.types';
import type { CycleEventDTO } from '../event/event.types';
import type { FeedSessionDTO } from '../feed/feed.types';
import type { InterventionAttemptDTO } from '../intervention/intervention.types';
import type { TimelineClusterDTO, TimelineClusterDraft } from './timeline-cluster.types';
import { classifyCluster } from './cluster-rules';

type SourceRecord =
  | { type: 'event'; id: string; kind: CycleEventDTO['kind']; recordedAt: string; babyId: string; label: string }
  | { type: 'feed-session-start'; id: string; recordedAt: string; babyId: string; label: string }
  | { type: 'feed-session-end'; id: string; recordedAt: string; babyId: string; label: string }
  | { type: 'feed-segment'; id: string; recordedAt: string; babyId: string; label: string }
  | { type: 'intervention'; id: string; recordedAt: string; babyId: string; kind: InterventionAttemptDTO['kind']; label: string }
  | { type: 'state-transition'; id: string; recordedAt: string; babyId: string; label: string };

function sortChronologically(records: SourceRecord[]) {
  return records.sort((left, right) => {
    const delta = new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime();
    if (delta !== 0) return delta;
    return left.id.localeCompare(right.id);
  });
}

function makeId(babyId: string, startedAt: string, clusterType: TimelineClusterDraft['clusterType']) {
  return `timeline_cluster:${babyId}:${clusterType}:${startedAt}`;
}

function createEmptyCluster(babyId: string, recordedAt: string): TimelineClusterDraft {
  return {
    id: makeId(babyId, recordedAt, 'UNCERTAIN'),
    babyId,
    routineDayId: recordedAt.slice(0, 10),
    startedAt: recordedAt,
    clusterType: 'UNCERTAIN',
    eventIds: [],
    interventionAttemptIds: [],
    feedSessionIds: [],
    diaperEventIds: [],
    stateTransitionIds: [],
    confidenceScore: 0,
    status: 'NEEDS_REVIEW',
    reason: 'cluster has not been classified yet'
  };
}

export function buildTimelineClusters(
  events: CycleEventDTO[],
  sessions: FeedSessionDTO[],
  interventions: InterventionAttemptDTO[],
  stateTransitions: BabyStateTransitionDTO[] = []
): TimelineClusterDTO[] {
  const babyId = events[0]?.babyId ?? sessions[0]?.babyId ?? interventions[0]?.babyId ?? stateTransitions[0]?.babyId ?? 'current-baby';
  const records: SourceRecord[] = [
    ...events.map((event) => ({
      type: 'event' as const,
      id: event.id,
      kind: event.kind,
      recordedAt: event.recordedAt,
      babyId: event.babyId ?? babyId,
      label: event.label
    })),
    ...sessions.flatMap((session) => [
      {
        type: 'feed-session-start' as const,
        id: session.id,
        recordedAt: session.startedAt,
        babyId: session.babyId,
        label: `${session.mode} feed`
      },
      ...session.segments.map((segment) => ({
        type: 'feed-segment' as const,
        id: segment.id,
        recordedAt: segment.recordedAt,
        babyId: session.babyId,
        label: segment.label
      })),
      ...(session.endedAt
        ? [
            {
              type: 'feed-session-end' as const,
              id: `${session.id}:end`,
              recordedAt: session.endedAt,
              babyId: session.babyId,
              label: `${session.mode} feed closed`
            }
          ]
        : [])
    ]),
    ...interventions.map((attempt) => ({
      type: 'intervention' as const,
      id: attempt.id,
      recordedAt: attempt.recordedAt,
      babyId: attempt.babyId,
      kind: attempt.kind,
      label: attempt.label
    })),
    ...stateTransitions.map((transition) => ({
      type: 'state-transition' as const,
      id: transition.id,
      recordedAt: transition.recordedAt,
      babyId: transition.babyId,
      label: `${transition.fromState} → ${transition.toState}`
    }))
  ];

  const sorted = sortChronologically(records);
  const clusters: TimelineClusterDraft[] = [];
  let currentCluster: TimelineClusterDraft | null = null;
  let lastRecordedAt = '';

  function flushCurrentCluster() {
    if (!currentCluster) return;
    const firstEvent = currentCluster.eventIds
      .map((id) => events.find((event) => event.id === id))
      .find((event): event is CycleEventDTO => Boolean(event));
    const signal = {
      startsWithWake: firstEvent?.kind === 'WAKE',
      startsWithCry: firstEvent?.kind === 'CRY',
      hasCry: currentCluster.eventIds.some((id) => events.find((event) => event.id === id)?.kind === 'CRY'),
      hasWake: currentCluster.eventIds.some((id) => events.find((event) => event.id === id)?.kind === 'WAKE'),
      hasFeedStart: currentCluster.feedSessionIds.length > 0,
      hasFeedSegment: currentCluster.feedSessionIds.some((sessionId) => sessions.find((session) => session.id === sessionId)?.segments.length > 0),
      hasSleepObserved: currentCluster.eventIds.some((id) => {
        const event = events.find((entry) => entry.id === id);
        return event?.kind === 'ASLEEP' || event?.kind === 'SLEEP_OBSERVED';
      }),
      hasPutDown: currentCluster.eventIds.some((id) => events.find((event) => event.id === id)?.kind === 'PUT_DOWN'),
      hasIntervention: currentCluster.interventionAttemptIds.length > 0,
      hasSoothingIntervention: currentCluster.interventionAttemptIds.some((id) => {
        const intervention = interventions.find((entry) => entry.id === id);
        return intervention?.kind === 'SOOTHE' || intervention?.kind === 'PAT' || intervention?.kind === 'SING' || intervention?.kind === 'WAIT';
      }),
      hasWakeAttempt: currentCluster.interventionAttemptIds.some((id) => interventions.find((entry) => entry.id === id)?.kind === 'WAKE_ATTEMPT'),
      hasPlay: currentCluster.eventIds.some((id) => events.find((event) => event.id === id)?.kind === 'PLAY'),
      hasDiaper: currentCluster.diaperEventIds.length > 0,
      itemCount:
        currentCluster.eventIds.length +
        currentCluster.feedSessionIds.length +
        currentCluster.interventionAttemptIds.length +
        currentCluster.stateTransitionIds.length
    };
    const classified = classifyCluster(signal);
    const reason =
      currentCluster.reason && currentCluster.reason !== 'wake/cry initiated the episode' ? currentCluster.reason : classified.reason;
  const confidenceScore = Math.max(currentCluster.confidenceScore, classified.confidenceScore);
  const needsReview = classified.needsReview || currentCluster.status === 'NEEDS_REVIEW';
    clusters.push({
      ...currentCluster,
      id: makeId(currentCluster.babyId, currentCluster.startedAt, classified.clusterType),
      clusterType: classified.clusterType,
      confidenceScore,
      needsReview,
      status: needsReview ? 'NEEDS_REVIEW' : currentCluster.status === 'COMPLETE' ? 'COMPLETE' : 'NEEDS_REVIEW',
      reason
    });
  }

  for (const record of sorted) {
    const gapMinutes = currentCluster
      ? (new Date(record.recordedAt).getTime() - new Date(lastRecordedAt).getTime()) / 60000
      : 0;
    const startsEpisode =
      (record.type === 'event' && ['WAKE', 'CRY', 'FEED'].includes(record.kind)) || record.type === 'feed-session-start';
    const startNewCluster =
      !currentCluster ||
      (currentCluster.status === 'COMPLETE' && startsEpisode && gapMinutes > 5);

    if (startNewCluster) {
      flushCurrentCluster();
      currentCluster = createEmptyCluster(record.babyId, record.recordedAt);
    }

    if (!currentCluster) continue;

    lastRecordedAt = record.recordedAt;
    currentCluster.endedAt = record.recordedAt;
    if (!currentCluster.startedAt || new Date(record.recordedAt).getTime() < new Date(currentCluster.startedAt).getTime()) {
      currentCluster.startedAt = record.recordedAt;
    }

    if (record.type === 'event') {
      currentCluster.eventIds.push(record.id);
      if (record.kind === 'DIAPER') currentCluster.diaperEventIds.push(record.id);
      if (record.kind === 'ASLEEP' || record.kind === 'SLEEP_OBSERVED') {
        currentCluster.status = currentCluster.status === 'NEEDS_REVIEW' ? 'NEEDS_REVIEW' : 'COMPLETE';
        currentCluster.endedAt = record.recordedAt;
      }
      if ((record.kind === 'WAKE' || record.kind === 'CRY') && currentCluster.eventIds.length === 1) {
        currentCluster.reason = 'wake/cry initiated the episode';
      }
      continue;
    }

    if (record.type === 'feed-session-start' || record.type === 'feed-session-end') {
      const sessionId = record.id.replace(':end', '');
      if (!currentCluster.feedSessionIds.includes(sessionId)) {
        currentCluster.feedSessionIds.push(sessionId);
      }
      if (record.type === 'feed-session-end') {
        currentCluster.status = 'COMPLETE';
      }
      continue;
    }

    if (record.type === 'intervention') {
      currentCluster.interventionAttemptIds.push(record.id);
      if (record.kind === 'WAKE_ATTEMPT' && currentCluster.reason === 'cluster has not been classified yet') {
        currentCluster.reason = 'early wake suspicion';
      }
      continue;
    }

    if (record.type === 'state-transition') {
      currentCluster.stateTransitionIds.push(record.id);
    }
  }

  flushCurrentCluster();

  return clusters.map((cluster) => ({
    ...cluster,
    id: cluster.id || makeId(cluster.babyId, cluster.startedAt, cluster.clusterType),
    routineDayId: cluster.routineDayId || cluster.startedAt.slice(0, 10)
  }));
}
