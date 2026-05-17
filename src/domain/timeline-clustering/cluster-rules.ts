import type { TimelineClusterType } from './timeline-cluster.types';

export type ClusterSignal = {
  startsWithWake: boolean;
  startsWithCry: boolean;
  hasCry: boolean;
  hasWake: boolean;
  hasFeedStart: boolean;
  hasFeedSegment: boolean;
  hasSleepObserved: boolean;
  hasPutDown: boolean;
  hasIntervention: boolean;
  hasSoothingIntervention: boolean;
  hasWakeAttempt: boolean;
  hasPlay: boolean;
  hasDiaper: boolean;
  itemCount: number;
};

export function classifyCluster(signal: ClusterSignal): {
  clusterType: TimelineClusterType;
  needsReview: boolean;
  confidenceScore: number;
  reason?: string;
} {
  if (signal.startsWithWake && signal.hasSoothingIntervention && signal.hasFeedStart) {
    return {
      clusterType: 'EARLY_WAKE_EPISODE',
      needsReview: false,
      confidenceScore: 0.9,
      reason: 'early wake episode with soothing before feed'
    };
  }

  if (signal.hasPlay && signal.hasSleepObserved && signal.hasFeedStart) {
    return {
      clusterType: 'RECOVERY_REGULATION_EPISODE',
      needsReview: false,
      confidenceScore: 0.88,
      reason: 'feed, play, and sleep resolved into one recovery episode'
    };
  }

  const interruptedFeedScore =
    Number(signal.startsWithCry) + Number(signal.hasFeedStart) + Number(signal.hasFeedSegment) + Number(signal.hasIntervention) + Number(signal.hasSleepObserved);
  const earlyWakeScore =
    Number(signal.startsWithWake) + Number(signal.hasWakeAttempt) + Number(signal.hasSoothingIntervention) + Number(signal.hasFeedStart);
  const settlingScore = Number(signal.hasPutDown) + Number(signal.hasSleepObserved) + Number(signal.hasIntervention);
  const feedOnlyScore = Number(signal.hasFeedStart) + Number(signal.hasFeedSegment) + Number(signal.hasSleepObserved);
  const recoveryScore = Number(signal.hasPlay) + Number(signal.hasDiaper) + Number(signal.hasIntervention) + Number(signal.hasSleepObserved);

  const candidates: Array<{ clusterType: TimelineClusterType; score: number; reason: string }> = [
    {
      clusterType: 'INTERRUPTED_FEED_EPISODE',
      score: interruptedFeedScore,
      reason: 'feed and settling activity share the same episode'
    },
    {
      clusterType: 'EARLY_WAKE_EPISODE',
      score: earlyWakeScore,
      reason: 'early wake activity with soothing attempts'
    },
    {
      clusterType: 'RECOVERY_REGULATION_EPISODE',
      score: recoveryScore,
      reason: 'caregiver used intervention and recovery activity to stabilize the episode'
    },
    {
      clusterType: 'SETTLING_EPISODE',
      score: settlingScore,
      reason: 'settling and transfer activity cluster together'
    },
    {
      clusterType: 'FEED_ONLY_EPISODE',
      score: feedOnlyScore,
      reason: 'feed activity without a strong settling sequence'
    }
  ].sort((left, right) => right.score - left.score);

  const winner = candidates[0];
  const runnerUp = candidates[1];

  if (winner.score === 0) {
    return {
      clusterType: 'UNCERTAIN',
      needsReview: true,
      confidenceScore: 0.1,
      reason: 'not enough signals to assign a cluster confidently'
    };
  }

  const ambiguous = runnerUp.score > 0 && runnerUp.score === winner.score;
  const needsReview =
    ambiguous ||
    (winner.clusterType === 'EARLY_WAKE_EPISODE' && signal.hasFeedStart && !signal.hasSleepObserved) ||
    (winner.clusterType === 'INTERRUPTED_FEED_EPISODE' && signal.itemCount < 3);

  return {
    clusterType: winner.clusterType,
    needsReview,
    confidenceScore: needsReview ? 0.6 : Math.min(0.98, 0.35 + winner.score * 0.15),
    reason: winner.reason
  };
}
