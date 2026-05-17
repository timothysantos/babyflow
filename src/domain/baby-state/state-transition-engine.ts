import type { CycleEventDTO } from '../event/event.types';
import type { FeedSessionDTO } from '../feed/feed.types';
import type { InterventionAttemptDTO } from '../intervention/intervention.types';
import type {
  BabyState,
  BabyStateTransitionConfidence,
  BabyStateTransitionDTO,
  BabyStateTransitionDraft
} from './baby-state.types';

type TransitionSource =
  | { type: 'cycle-event'; id: string; label: string; kind: CycleEventDTO['kind']; recordedAt: string }
  | { type: 'feed-session'; id: string; label: string; kind: 'FEED_START' | 'FEED_END'; recordedAt: string }
  | { type: 'intervention'; id: string; label: string; kind: InterventionAttemptDTO['kind']; recordedAt: string };

type StateRecord = TransitionSource & { order: number };

function nowIso() {
  return new Date().toISOString();
}

function stateFromEventKind(kind: CycleEventDTO['kind']): BabyState | null {
  if (kind === 'CRY') return 'CRYING';
  if (kind === 'FEED') return 'FEEDING';
  if (kind === 'PLAY') return 'SELF_ENTERTAINING';
  if (kind === 'BURP') return 'SETTLING';
  if (kind === 'PUT_DOWN') return 'SETTLING';
  if (kind === 'ASLEEP' || kind === 'SLEEP_OBSERVED') return 'ASLEEP';
  if (kind === 'WAKE') return 'AWAKE_CALM';
  return null;
}

function stateFromIntervention(kind: InterventionAttemptDTO['kind']): BabyState | null {
  if (kind === 'SOOTHE' || kind === 'PAT' || kind === 'SING' || kind === 'WAIT' || kind === 'BURP') return 'SETTLING';
  if (kind === 'WAKE_ATTEMPT') return 'AWAKE_CALM';
  return null;
}

function inferConfidence(source: TransitionSource, toState: BabyState): BabyStateTransitionConfidence {
  if (source.type === 'cycle-event' && (source.kind === 'ASLEEP' || source.kind === 'SLEEP_OBSERVED' || source.kind === 'CRY' || source.kind === 'WAKE')) {
    return 'CONFIRMED';
  }
  if (source.type === 'feed-session' && source.kind === 'FEED_START') {
    return toState === 'FEEDING' ? 'CONFIRMED' : 'LIKELY';
  }
  if (source.type === 'intervention') {
    return source.kind === 'WAKE_ATTEMPT' ? 'LIKELY' : 'UNSURE';
  }
  return 'LIKELY';
}

function makeId(source: TransitionSource, fromState: BabyState, toState: BabyState) {
  return `${source.type}:${source.id}:${fromState}->${toState}:${source.recordedAt}`;
}

function normalizeRecords(events: CycleEventDTO[], sessions: FeedSessionDTO[], interventions: InterventionAttemptDTO[]) {
  const records: StateRecord[] = [];

  events.forEach((event, order) => {
    records.push({
      type: 'cycle-event',
      id: event.id,
      label: event.label,
      kind: event.kind,
      recordedAt: event.recordedAt,
      order
    });
  });

  sessions.forEach((session, order) => {
    records.push({
      type: 'feed-session',
      id: session.id,
      label: session.mode === 'BREAST' ? `${session.mode} feed` : session.mode,
      kind: 'FEED_START',
      recordedAt: session.startedAt,
      order: events.length + order
    });

    if (session.endedAt) {
      records.push({
        type: 'feed-session',
        id: `${session.id}:end`,
        label: `${session.mode} feed closed`,
        kind: 'FEED_END',
        recordedAt: session.endedAt,
        order: events.length + sessions.length + order
      });
    }
  });

  interventions.forEach((attempt, order) => {
    records.push({
      type: 'intervention',
      id: attempt.id,
      label: attempt.label,
      kind: attempt.kind,
      recordedAt: attempt.recordedAt,
      order: events.length + sessions.length + interventions.length + order
    });
  });

  return records.sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime() || left.order - right.order);
}

function emitTransition(
  records: BabyStateTransitionDraft[],
  source: TransitionSource,
  fromState: BabyState,
  toState: BabyState,
  note?: string,
  confidenceOverride?: BabyStateTransitionConfidence
) {
  if (fromState === toState) return;
  records.push({
    babyId: 'current-baby',
    fromState,
    toState,
    confidence: confidenceOverride ?? inferConfidence(source, toState),
    recordedAt: source.recordedAt,
    sourceType: source.type,
    sourceId: source.id,
    triggerLabel: source.label,
    triggerKind: source.kind,
    note
  });
}

export function buildBabyStateTransitions(
  events: CycleEventDTO[],
  sessions: FeedSessionDTO[],
  interventions: InterventionAttemptDTO[] = []
): BabyStateTransitionDTO[] {
  const records = normalizeRecords(events, sessions, interventions);
  const transitions: BabyStateTransitionDraft[] = [];
  let currentState: BabyState = 'AWAKE_CALM';
  let activeFeedAt: FeedSessionDTO | null = null;

  for (const record of records) {
    if (record.type === 'feed-session') {
      if (record.kind === 'FEED_START') {
        const nextState: BabyState = currentState === 'CRYING' ? 'FEEDING' : currentState === 'DROWSY' ? 'FEEDING' : 'FEEDING';
        emitTransition(transitions, record, currentState, nextState);
        currentState = nextState;
        const session = sessions.find((entry) => entry.id === record.id);
        activeFeedAt = session ?? activeFeedAt;
      } else if (record.kind === 'FEED_END') {
        activeFeedAt = null;
      }
      continue;
    }

    if (record.type === 'intervention') {
      const nextState = stateFromIntervention(record.kind);
      if (nextState) {
        emitTransition(transitions, record, currentState, nextState, 'caregiver intervention attempt');
        currentState = nextState;
      }
      continue;
    }

    const nextState = stateFromEventKind(record.kind);
    if (!nextState) continue;

    if ((record.kind === 'ASLEEP' || record.kind === 'SLEEP_OBSERVED') && activeFeedAt) {
      emitTransition(transitions, record, currentState, 'DROWSY', 'fell asleep during feed', 'LIKELY');
      currentState = 'DROWSY';
    }

    emitTransition(transitions, record, currentState, nextState, record.kind === 'SLEEP_OBSERVED' ? 'observed sleep' : undefined);
    currentState = nextState;
  }

  return transitions.map((transition) => ({
    id: makeId(
      {
        type: transition.sourceType,
        id: transition.sourceId,
        label: transition.triggerLabel,
        kind: transition.triggerKind as TransitionSource['kind'],
        recordedAt: transition.recordedAt
      },
      transition.fromState,
      transition.toState
    ),
    ...transition,
    babyId: transition.babyId ?? 'current-baby',
    recordedAt: transition.recordedAt || nowIso()
  }));
}
