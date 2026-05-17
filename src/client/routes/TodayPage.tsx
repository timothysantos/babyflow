import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileShell } from '../layouts/MobileShell';
import { PageShell } from '../layouts/PageShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { EventLog } from '../components/events/EventLog';
import type { CycleEventDTO, CycleEventKind } from '../../domain/event/event.types';
import { FeedSessionsPanel } from '../components/feed/FeedSessionsPanel';
import { InterventionAttemptsPanel } from '../components/intervention/InterventionAttemptsPanel';
import type { FeedSessionDTO, FeedSegmentDTO, FeedSessionMode } from '../../domain/feed/feed.types';
import { buildPaperJournalRowViewModel } from '../components/journal/paper-journal-view-model';
import { JournalRowSummary } from '../components/journal/JournalRowSummary';
import { PaperJournalView } from '../components/journal/PaperJournalView';
import { PaperJournalCellEditSheet } from '../components/timeline/PaperJournalCellEditSheet';
import { CompactBlockDetailSheet } from '../components/timeline/CompactBlockDetailSheet';
import { StateTransitionViewer } from '../components/state/StateTransitionViewer';
import { LiveTimelineStream } from '../components/timeline/LiveTimelineStream';
import { CorrectionHistoryPanel } from '../components/timeline/CorrectionHistoryPanel';
import { TimelineDetailSheet } from '../components/timeline/TimelineDetailSheet';
import { TimelineEditSheet } from '../components/timeline/TimelineEditSheet';
import { buildTimelineItems } from '../components/timeline/timeline-view-model';
import { buildTimelineClusters } from '../../domain/timeline-clustering/cluster-engine';
import type { TimelineClusterDTO } from '../../domain/timeline-clustering/timeline-cluster.types';
import { ClusterReviewPanel } from '../components/review/ClusterReviewPanel';
import { NeedsReviewBanner } from '../components/review/NeedsReviewBanner';
import type { TimelineItemDTO } from '../components/timeline/timeline.types';
import type { CorrectionHistoryDTO } from '../../domain/correction/correction-history.types';
import type { InterventionAttemptDTO, InterventionAttemptKind, InterventionAttemptOutcome } from '../../domain/intervention/intervention.types';
import { buildBabyStateTransitions } from '../../domain/baby-state/state-transition-engine';

type TodayViewMode = 'timeline' | 'journal' | 'compact';
type UndoRecord =
  | { action: 'SOFT_DELETE'; item: TimelineItemDTO }
  | { action: 'UPDATE_TIME'; item: TimelineItemDTO; previousValue: string }
  | { action: 'UPDATE_DETAILS'; item: TimelineItemDTO; previousValue: string }
  | {
      action: 'PROJECT_CELL';
      key: keyof ReturnType<typeof buildPaperJournalRowViewModel>;
      previousValue: string;
      sourceType: 'cycle-event' | 'feed-session';
      sourceId: string;
      created: boolean;
    };

type CorrectionSnapshot =
  | { sourceType: 'cycle-event'; event: CycleEventDTO }
  | { sourceType: 'feed-session'; session: FeedSessionDTO }
  | { sourceType: 'feed-segment'; sessionId: string; segment: FeedSegmentDTO };

type CellEditorState = {
  key: keyof ReturnType<typeof buildPaperJournalRowViewModel>;
  label: string;
  value: string;
  sourceType: 'cycle-event' | 'feed-session';
  sourceId: string;
  duplicateSourceId?: string | null;
} | null;

type CorrectionReason =
  | 'wrong_time'
  | 'accidental_tap'
  | 'duplicate'
  | 'late_entry'
  | 'paper_journal'
  | 'facilitator_advice'
  | 'other';

function normalizeViewMode(value: string | null): TodayViewMode {
  if (value === 'timeline' || value === 'journal' || value === 'compact') return value;
  if (value === 'true') return 'compact';
  return 'timeline';
}

function eventsUrl() {
  return new URL('/cycle-events', window.location.origin);
}

function feedsUrl() {
  return new URL('/feed-sessions', window.location.origin);
}

function interventionsUrl() {
  return new URL('/interventions', window.location.origin);
}

async function parseJsonResponse<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${label} request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

export function TodayPage() {
  const [viewMode, setViewMode] = useState<TodayViewMode>(() =>
    normalizeViewMode(window.localStorage.getItem('babyflow.today.viewMode') ?? window.localStorage.getItem('babyflow.today.compactMode'))
  );
  const [detailsOpen, setDetailsOpen] = useState(() => window.localStorage.getItem('babyflow.today.rowDetailsOpen') === 'true');
  const [now, setNow] = useState(() => Date.now());
  const [events, setEvents] = useState<CycleEventDTO[]>([]);
  const [feedSessions, setFeedSessions] = useState<FeedSessionDTO[]>([]);
  const [interventionAttempts, setInterventionAttempts] = useState<InterventionAttemptDTO[]>([]);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItemDTO | null>(null);
  const [timelineEditor, setTimelineEditor] = useState<{
    item: TimelineItemDTO;
    mode: 'time' | 'details';
  } | null>(null);
  const [paperJournalEditor, setPaperJournalEditor] = useState<CellEditorState>(null);
  const [paperJournalReason, setPaperJournalReason] = useState<CorrectionReason | ''>('');
  const [compactBlockEditor, setCompactBlockEditor] = useState<CellEditorState>(null);
  const [compactBlockReason, setCompactBlockReason] = useState<CorrectionReason | ''>('');
  const [correctionHistory, setCorrectionHistory] = useState<CorrectionHistoryDTO[]>([]);
  const [undoStack, setUndoStack] = useState<UndoRecord[]>([]);
  const [timelineEditReason, setTimelineEditReason] = useState<CorrectionReason | ''>('');
  const [reviewedClusterIds, setReviewedClusterIds] = useState<string[]>([]);
  const correctionSnapshots = useRef(new Map<string, CorrectionSnapshot>());

  const derivedBabyStateTransitions = useMemo(
    () => buildBabyStateTransitions(events, feedSessions, interventionAttempts),
    [events, feedSessions, interventionAttempts]
  );
  const rowViewModel = useMemo(
    () => buildPaperJournalRowViewModel(events, feedSessions, interventionAttempts, derivedBabyStateTransitions, new Date(now)),
    [events, feedSessions, interventionAttempts, derivedBabyStateTransitions, now]
  );
  const timelineItems = useMemo(() => buildTimelineItems(events, feedSessions, new Date(now)), [events, feedSessions, now]);
  const timelineClusters = useMemo<TimelineClusterDTO[]>(
    () =>
      buildTimelineClusters(events, feedSessions, interventionAttempts, derivedBabyStateTransitions).map((cluster) =>
        reviewedClusterIds.includes(cluster.id) ? { ...cluster, needsReview: false, status: 'COMPLETE' } : cluster
      ),
    [events, feedSessions, interventionAttempts, derivedBabyStateTransitions, reviewedClusterIds]
  );
  const needsReviewCount = timelineClusters.filter((cluster) => cluster.needsReview).length;

  function findDuplicateCycleEvent(kind: CycleEventKind, sourceId: string) {
    return events.find((event) => event.kind === kind && event.id !== sourceId) ?? null;
  }

  function resolveCellEditorState(key: keyof ReturnType<typeof buildPaperJournalRowViewModel>, label: string, value: string): CellEditorState {
    if (key === 'wakeUpTime') {
      const source = events.find((event) => event.kind === 'WAKE');
      return {
        key,
        label,
        value,
        sourceType: 'cycle-event',
        sourceId: source?.id ?? `manual-wake-${events.length + 1}`,
        duplicateSourceId: findDuplicateCycleEvent('WAKE', source?.id ?? '')?.id ?? null
      };
    }
    if (key === 'startOfFeedTime') {
      const session = feedSessions[0];
      return {
        key,
        label,
        value,
        sourceType: 'feed-session',
        sourceId: session?.id ?? `manual-feed-${feedSessions.length + 1}`,
        duplicateSourceId: feedSessions.find((entry) => entry.id !== session?.id && entry.mode === (session?.mode ?? 'BREAST'))?.id ?? null
      };
    }
    if (key === 'startOfPlayTime') {
      const source = events.find((event) => event.kind === 'PLAY');
      return {
        key,
        label,
        value,
        sourceType: 'cycle-event',
        sourceId: source?.id ?? `manual-play-${events.length + 1}`,
        duplicateSourceId: findDuplicateCycleEvent('PLAY', source?.id ?? '')?.id ?? null
      };
    }
    if (key === 'startOfSleepTime') {
      const source = events.find((event) => event.kind === 'ASLEEP' || event.kind === 'PUT_DOWN');
      return {
        key,
        label,
        value,
        sourceType: 'cycle-event',
        sourceId: source?.id ?? `manual-sleep-${events.length + 1}`,
        duplicateSourceId: source ? findDuplicateCycleEvent(source.kind, source.id)?.id ?? null : null
      };
    }
    if (key === 'urine' || key === 'stool') {
      const source = events.find((event) => event.kind === 'DIAPER');
      return {
        key,
        label,
        value,
        sourceType: 'cycle-event',
        sourceId: source?.id ?? `manual-diaper-${events.length + 1}`,
        duplicateSourceId: findDuplicateCycleEvent('DIAPER', source?.id ?? '')?.id ?? null
      };
    }
    const source = events.find((event) => event.kind === 'NOTE');
    return {
      key,
      label,
      value,
      sourceType: 'cycle-event',
      sourceId: source?.id ?? `manual-note-${events.length + 1}`,
      duplicateSourceId: findDuplicateCycleEvent('NOTE', source?.id ?? '')?.id ?? null
    };
  }

  function removeProjectionSource(sourceType: 'cycle-event' | 'feed-session', sourceId: string) {
    if (sourceType === 'cycle-event') {
      setEvents((current) => current.filter((event) => event.id !== sourceId));
      return;
    }
    setFeedSessions((current) => current.filter((session) => session.id !== sourceId));
  }

  function rememberProjectionSnapshot(sourceType: 'cycle-event' | 'feed-session' | 'feed-segment', sourceId: string) {
    if (sourceType === 'cycle-event') {
      const event = events.find((entry) => entry.id === sourceId);
      if (event) correctionSnapshots.current.set(sourceId, { sourceType, event });
      return;
    }
    if (sourceType === 'feed-session') {
      const session = feedSessions.find((entry) => entry.id === sourceId);
      if (session) correctionSnapshots.current.set(sourceId, { sourceType, session });
      return;
    }
    for (const session of feedSessions) {
      const segment = session.segments.find((entry) => entry.id === sourceId);
      if (segment) {
        correctionSnapshots.current.set(sourceId, { sourceType, sessionId: session.id, segment });
        return;
      }
    }
  }

  function updateProjectionSource(sourceType: 'cycle-event' | 'feed-session', sourceId: string, key: CellEditorState['key'], nextValue: string) {
    if (sourceType === 'cycle-event') {
      if (key === 'wakeUpTime') {
        setEvents((current) =>
          current.map((event) => (event.id === sourceId ? { ...event, kind: 'WAKE', label: 'wake', recordedAt: nextValue } : event))
        );
      }
      if (key === 'startOfPlayTime') {
        setEvents((current) =>
          current.map((event) => (event.id === sourceId ? { ...event, kind: 'PLAY', label: 'play', recordedAt: nextValue } : event))
        );
      }
      if (key === 'startOfSleepTime') {
        setEvents((current) =>
          current.map((event) =>
            event.id === sourceId ? { ...event, kind: event.kind === 'ASLEEP' ? 'ASLEEP' : 'PUT_DOWN', recordedAt: nextValue } : event
          )
        );
      }
      if (key === 'urine' || key === 'stool') {
        setEvents((current) =>
          current.map((event) => (event.id === sourceId ? { ...event, kind: 'DIAPER', label: nextValue } : event))
        );
      }
      if (key === 'remarks') {
        setEvents((current) =>
          current.map((event) => (event.id === sourceId ? { ...event, kind: 'NOTE', label: nextValue } : event))
        );
      }
      return;
    }
    setFeedSessions((current) =>
      current.map((session) =>
        session.id === sourceId
          ? {
              ...session,
              mode: session.mode,
              startedAt: nextValue,
              segments: session.segments
            }
          : session
      )
    );
  }

  function suggestedReasonForTimelineEdit(item: TimelineItemDTO): CorrectionReason {
    if (item.kind === 'CYCLE_EVENT' && item.title === 'play') {
      return 'wrong_time';
    }
    if (item.kind === 'FEED_SESSION_START' || item.kind === 'FEED_SEGMENT') {
      return 'late_entry';
    }
    return 'other';
  }

  function suggestedReasonForCell(editor: NonNullable<CellEditorState>): CorrectionReason {
    if (editor.duplicateSourceId) return 'duplicate';
    if (editor.key === 'wakeUpTime' || editor.key === 'startOfPlayTime' || editor.key === 'startOfSleepTime') return 'wrong_time';
    if (editor.key === 'startOfFeedTime') return 'late_entry';
    return 'other';
  }

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.viewMode', viewMode);
    window.localStorage.setItem('babyflow.today.compactMode', String(viewMode === 'compact'));
  }, [viewMode]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.rowDetailsOpen', String(detailsOpen));
  }, [detailsOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetch(eventsUrl())
      .then((response) => parseJsonResponse<{ events?: CycleEventDTO[] }>(response, 'cycle-events'))
      .then((payload: { events?: CycleEventDTO[] }) =>
        setEvents((current) => (current.length > 0 ? current : payload.events ?? []))
      )
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    void fetch(feedsUrl())
      .then((response) => parseJsonResponse<{ sessions?: FeedSessionDTO[] }>(response, 'feed-sessions'))
      .then((payload: { sessions?: FeedSessionDTO[] }) =>
        setFeedSessions((current) => (current.length > 0 ? current : payload.sessions ?? []))
      )
      .catch(() => setFeedSessions([]));
  }, []);

  useEffect(() => {
    void fetch(interventionsUrl())
      .then((response) => parseJsonResponse<{ interventions?: InterventionAttemptDTO[] }>(response, 'interventions'))
      .then((payload: { interventions?: InterventionAttemptDTO[] }) =>
        setInterventionAttempts((current) => (current.length > 0 ? current : payload.interventions ?? []))
      )
      .catch(() => setInterventionAttempts([]));
  }, []);

  async function recordEvent(kind: CycleEventKind) {
    const response = await fetch(eventsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, label: kind.toLowerCase().replaceAll('_', ' '), babyId: 'current-baby' })
    });
    const payload = await parseJsonResponse<{ event?: CycleEventDTO }>(response, 'cycle-events');
    if (payload.event) {
      setEvents((current) => [payload.event!, ...current]);
    }
  }

  function recordCorrection(
    action: CorrectionHistoryDTO['action'],
    sourceId: string,
    sourceType: CorrectionHistoryDTO['sourceType'],
    summary: string,
    reason?: CorrectionHistoryDTO['reason']
  ) {
    setCorrectionHistory((current) => [
      {
        id: `${action}:${sourceId}:${current.length + 1}`,
        action,
        sourceId,
        sourceType,
        createdAt: new Date().toISOString(),
        summary,
        reason
      },
      ...current
    ]);
  }

  function restoreCorrectionFromHistory(item: CorrectionHistoryDTO) {
    const snapshot = correctionSnapshots.current.get(item.sourceId);
    if (snapshot?.sourceType === 'cycle-event') {
      setEvents((current) => (current.some((event) => event.id === snapshot.event.id) ? current : [snapshot.event, ...current]));
      recordCorrection('correction.restore', item.sourceId, item.sourceType, `Restored ${item.summary}`);
      return;
    }
    if (snapshot?.sourceType === 'feed-session') {
      setFeedSessions((current) => (current.some((session) => session.id === snapshot.session.id) ? current : [snapshot.session, ...current]));
      recordCorrection('correction.restore', item.sourceId, item.sourceType, `Restored ${item.summary}`);
      return;
    }
    if (snapshot?.sourceType === 'feed-segment') {
      setFeedSessions((current) =>
        current.map((session) =>
          session.id === snapshot.sessionId && !session.segments.some((segment) => segment.id === snapshot.segment.id)
            ? { ...session, segments: [snapshot.segment, ...session.segments] }
            : session
        )
      );
      recordCorrection('correction.restore', item.sourceId, item.sourceType, `Restored ${item.summary}`);
      return;
    }
    undoLastAction();
  }

  function pushUndo(record: UndoRecord) {
    setUndoStack((current) => [record, ...current]);
  }

  function updateJournalProjectionCell(key: CellEditorState['key'], nextValue: string, reason?: CorrectionReason | '') {
    if (key === 'wakeUpTime') {
      const wake = events.find((event) => event.kind === 'WAKE');
      if (wake) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.wakeUpTime.display,
          sourceType: 'cycle-event',
          sourceId: wake.id,
          created: false
        });
        setEvents((current) => current.map((event) => (event.id === wake.id ? { ...event, recordedAt: nextValue } : event)));
      } else {
        const createdId = `manual-wake-${events.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.wakeUpTime.display,
          sourceType: 'cycle-event',
          sourceId: createdId,
          created: true
        });
        setEvents((current) => [
          {
            id: createdId,
            kind: 'WAKE',
            label: 'wake',
            babyId: 'current-baby',
            recordedAt: nextValue
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', wake?.id ?? 'manual-wake', 'cycle-event', `Updated ${key}`, reason || undefined);
      return;
    }
    if (key === 'startOfFeedTime') {
      const session = feedSessions[0];
      if (session) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.startOfFeedTime.display,
          sourceType: 'feed-session',
          sourceId: session.id,
          created: false
        });
        setFeedSessions((current) => current.map((entry) => (entry.id === session.id ? { ...entry, startedAt: nextValue } : entry)));
      } else {
        const createdId = `manual-feed-${feedSessions.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.startOfFeedTime.display,
          sourceType: 'feed-session',
          sourceId: createdId,
          created: true
        });
        setFeedSessions((current) => [
          {
            id: createdId,
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: nextValue,
            segments: []
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', session?.id ?? 'manual-feed', 'feed-session', `Updated ${key}`, reason || undefined);
      return;
    }
    if (key === 'startOfPlayTime') {
      const play = events.find((event) => event.kind === 'PLAY');
      if (play) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.startOfPlayTime.display,
          sourceType: 'cycle-event',
          sourceId: play.id,
          created: false
        });
        setEvents((current) => current.map((event) => (event.id === play.id ? { ...event, recordedAt: nextValue } : event)));
      } else {
        const createdId = `manual-play-${events.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.startOfPlayTime.display,
          sourceType: 'cycle-event',
          sourceId: createdId,
          created: true
        });
        setEvents((current) => [
          {
            id: createdId,
            kind: 'PLAY',
            label: 'play',
            babyId: 'current-baby',
            recordedAt: nextValue
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', play?.id ?? 'manual-play', 'cycle-event', `Updated ${key}`, reason || undefined);
      return;
    }
    if (key === 'startOfSleepTime') {
      const sleep = events.find((event) => event.kind === 'ASLEEP' || event.kind === 'PUT_DOWN');
      if (sleep) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.startOfSleepTime.display,
          sourceType: 'cycle-event',
          sourceId: sleep.id,
          created: false
        });
        setEvents((current) => current.map((event) => (event.id === sleep.id ? { ...event, recordedAt: nextValue } : event)));
      } else {
        const createdId = `manual-sleep-${events.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.startOfSleepTime.display,
          sourceType: 'cycle-event',
          sourceId: createdId,
          created: true
        });
        setEvents((current) => [
          {
            id: createdId,
            kind: 'PUT_DOWN',
            label: 'put down',
            babyId: 'current-baby',
            recordedAt: nextValue
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', sleep?.id ?? 'manual-sleep', 'cycle-event', `Updated ${key}`, reason || undefined);
      return;
    }
    if (key === 'urine') {
      const diaper = events.find((event) => event.kind === 'DIAPER');
      if (diaper) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.urine.display,
          sourceType: 'cycle-event',
          sourceId: diaper.id,
          created: false
        });
        setEvents((current) => current.map((event) => (event.id === diaper.id ? { ...event, label: nextValue } : event)));
      } else {
        const createdId = `manual-diaper-${events.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.urine.display,
          sourceType: 'cycle-event',
          sourceId: createdId,
          created: true
        });
        setEvents((current) => [
          {
            id: createdId,
            kind: 'DIAPER',
            label: nextValue,
            babyId: 'current-baby',
            recordedAt: new Date().toISOString()
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', diaper?.id ?? 'manual-diaper', 'cycle-event', `Updated ${key}`, reason || undefined);
      return;
    }
    if (key === 'stool') {
      const diaper = events.find((event) => event.kind === 'DIAPER');
      if (diaper) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.stool.display,
          sourceType: 'cycle-event',
          sourceId: diaper.id,
          created: false
        });
        setEvents((current) => current.map((event) => (event.id === diaper.id ? { ...event, label: nextValue } : event)));
      } else {
        const createdId = `manual-diaper-${events.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.stool.display,
          sourceType: 'cycle-event',
          sourceId: createdId,
          created: true
        });
        setEvents((current) => [
          {
            id: createdId,
            kind: 'DIAPER',
            label: nextValue,
            babyId: 'current-baby',
            recordedAt: new Date().toISOString()
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', diaper?.id ?? 'manual-diaper', 'cycle-event', `Updated ${key}`, reason || undefined);
      return;
    }
    if (key === 'remarks') {
      const note = events.find((event) => event.kind === 'NOTE');
      if (note) {
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.remarks.display,
          sourceType: 'cycle-event',
          sourceId: note.id,
          created: false
        });
        setEvents((current) => current.map((event) => (event.id === note.id ? { ...event, label: nextValue } : event)));
      } else {
        const createdId = `manual-note-${events.length + 1}`;
        pushUndo({
          action: 'PROJECT_CELL',
          key,
          previousValue: rowViewModel.remarks.display,
          sourceType: 'cycle-event',
          sourceId: createdId,
          created: true
        });
        setEvents((current) => [
          {
            id: createdId,
            kind: 'NOTE',
            label: nextValue,
            babyId: 'current-baby',
            recordedAt: new Date().toISOString()
          },
          ...current
        ]);
      }
      recordCorrection('correction.update', note?.id ?? 'manual-note', 'cycle-event', 'Updated remarks', reason || undefined);
    }
  }

  function deleteJournalProjectionCell(editor: NonNullable<CellEditorState>, reason?: CorrectionReason | '') {
    rememberProjectionSnapshot(editor.sourceType, editor.sourceId);
    pushUndo({
      action: 'PROJECT_CELL',
      key: editor.key,
      previousValue: editor.value,
      sourceType: editor.sourceType,
      sourceId: editor.sourceId,
      created: editor.value === '—'
    });
    removeProjectionSource(editor.sourceType, editor.sourceId);
    recordCorrection('correction.soft_delete', editor.sourceId, editor.sourceType, `Deleted ${editor.label}`, reason || undefined);
  }

  function mergeJournalProjectionCell(editor: NonNullable<CellEditorState>, reason?: CorrectionReason | '') {
    if (!editor.duplicateSourceId) {
      return;
    }
    rememberProjectionSnapshot(editor.sourceType, editor.duplicateSourceId);
    pushUndo({
      action: 'PROJECT_CELL',
      key: editor.key,
      previousValue: editor.value,
      sourceType: editor.sourceType,
      sourceId: editor.sourceId,
      created: false
    });
    removeProjectionSource(editor.sourceType, editor.duplicateSourceId);
    recordCorrection('correction.merge', editor.duplicateSourceId, editor.sourceType, `Merged duplicate ${editor.label}`, reason || undefined);
  }

  function softDeleteTimelineItem(item: TimelineItemDTO, reason?: CorrectionReason | '') {
    rememberProjectionSnapshot(item.sourceType, item.sourceId);
    if (item.sourceType === 'cycle-event') {
      const deleted = events.find((event) => event.id === item.sourceId);
      if (deleted) {
        pushUndo({ action: 'SOFT_DELETE', item });
      }
      setEvents((current) => current.filter((event) => event.id !== item.sourceId));
    }
    if (item.sourceType === 'feed-session') {
      const deleted = feedSessions.find((session) => session.id === item.sourceId);
      if (deleted) {
        pushUndo({ action: 'SOFT_DELETE', item });
      }
      setFeedSessions((current) => current.filter((session) => session.id !== item.sourceId));
    }
    if (item.sourceType === 'feed-segment') {
      pushUndo({ action: 'SOFT_DELETE', item });
      setFeedSessions((current) =>
        current.map((session) => ({
          ...session,
          segments: session.segments.filter((segment) => segment.id !== item.sourceId)
        }))
      );
    }
    recordCorrection('correction.soft_delete', item.sourceId, item.sourceType, `Soft deleted ${item.title}`, reason || undefined);
    setSelectedTimelineItem((current) => (current?.id === item.id ? null : current));
  }

  function updateTimelineItemTime(item: TimelineItemDTO, nextRecordedAt: string, reason?: CorrectionReason | '') {
    pushUndo({ action: 'UPDATE_TIME', item, previousValue: item.recordedAt });
    if (item.sourceType === 'cycle-event') {
      setEvents((current) =>
        current.map((event) => (event.id === item.sourceId ? { ...event, recordedAt: nextRecordedAt } : event))
      );
    }
    if (item.sourceType === 'feed-session') {
      setFeedSessions((current) =>
        current.map((session) =>
          session.id === item.sourceId ? { ...session, startedAt: nextRecordedAt, endedAt: session.endedAt } : session
        )
      );
    }
    if (item.sourceType === 'feed-segment') {
      setFeedSessions((current) =>
        current.map((session) => ({
          ...session,
          segments: session.segments.map((segment) =>
            segment.id === item.sourceId ? { ...segment, recordedAt: nextRecordedAt } : segment
          )
        }))
      );
    }
    setSelectedTimelineItem((current) =>
      current?.id === item.id ? { ...item, recordedAt: nextRecordedAt } : current
    );
    recordCorrection('correction.update', item.sourceId, item.sourceType, `Updated time for ${item.title}`, reason || undefined);
  }

  function updateTimelineItemDetails(item: TimelineItemDTO, nextDetails: string, reason?: CorrectionReason | '') {
    pushUndo({ action: 'UPDATE_DETAILS', item, previousValue: item.details });
    if (item.sourceType === 'cycle-event') {
      setEvents((current) => current.map((event) => (event.id === item.sourceId ? { ...event, label: nextDetails } : event)));
    }
    if (item.sourceType === 'feed-segment') {
      setFeedSessions((current) =>
        current.map((session) => ({
          ...session,
          segments: session.segments.map((segment) =>
            segment.id === item.sourceId ? { ...segment, label: nextDetails } : segment
          )
        }))
      );
    }
    setSelectedTimelineItem((current) =>
      current?.id === item.id ? { ...item, details: nextDetails } : current
    );
    recordCorrection('correction.update', item.sourceId, item.sourceType, `Updated details for ${item.title}`, reason || undefined);
  }

  function mergeDuplicateTimelineItem(item: TimelineItemDTO, reason?: CorrectionReason | '') {
    const duplicate = timelineItems.find((entry) => entry.id !== item.id && entry.title === item.title && entry.details === item.details);
    if (!duplicate) {
      return;
    }
    rememberProjectionSnapshot(duplicate.sourceType, duplicate.sourceId);
    pushUndo({ action: 'SOFT_DELETE', item: duplicate });
    softDeleteTimelineItem(duplicate);
    recordCorrection('correction.merge', duplicate.sourceId, duplicate.sourceType, `Merged duplicate ${duplicate.title}`, reason || undefined);
  }

  function undoLastAction() {
    const last = undoStack[0];
    if (!last) return;
    if (last.action === 'SOFT_DELETE') {
      if (last.item.sourceType === 'cycle-event') {
        const deleted = events.find((event) => event.id === last.item.sourceId);
        if (!deleted) {
          setEvents((current) => [{ id: last.item.sourceId, kind: 'NOTE', label: last.item.details, recordedAt: last.item.recordedAt }, ...current]);
        }
      }
      if (last.item.sourceType === 'feed-session') {
        const deleted = feedSessions.find((session) => session.id === last.item.sourceId);
        if (!deleted) {
          setFeedSessions((current) => [
            {
              id: last.item.sourceId,
              babyId: 'current-baby',
              mode: 'BREAST',
              startedAt: last.item.recordedAt,
              segments: []
            },
            ...current
          ]);
        }
      }
    }
    if (last.action === 'UPDATE_TIME') {
      if (last.item.sourceType === 'cycle-event') {
        setEvents((current) =>
          current.map((event) => (event.id === last.item.sourceId ? { ...event, recordedAt: last.previousValue } : event))
        );
      }
      if (last.item.sourceType === 'feed-session') {
        setFeedSessions((current) =>
          current.map((session) =>
            session.id === last.item.sourceId ? { ...session, startedAt: last.previousValue } : session
          )
        );
      }
      if (last.item.sourceType === 'feed-segment') {
        setFeedSessions((current) =>
          current.map((session) => ({
            ...session,
            segments: session.segments.map((segment) =>
              segment.id === last.item.sourceId ? { ...segment, recordedAt: last.previousValue } : segment
            )
          }))
        );
      }
    }
    if (last.action === 'UPDATE_DETAILS') {
      if (last.item.sourceType === 'cycle-event') {
        setEvents((current) => current.map((event) => (event.id === last.item.sourceId ? { ...event, label: last.previousValue } : event)));
      }
      if (last.item.sourceType === 'feed-segment') {
        setFeedSessions((current) =>
          current.map((session) => ({
            ...session,
            segments: session.segments.map((segment) =>
              segment.id === last.item.sourceId ? { ...segment, label: last.previousValue } : segment
            )
          }))
        );
      }
    }
    if (last.action === 'PROJECT_CELL') {
      if (last.created) {
        if (last.sourceType === 'cycle-event') {
          setEvents((current) => current.filter((event) => event.id !== last.sourceId));
        }
        if (last.sourceType === 'feed-session') {
          setFeedSessions((current) => current.filter((session) => session.id !== last.sourceId));
        }
      } else if (last.sourceType === 'cycle-event') {
        if (last.key === 'wakeUpTime') {
          setEvents((current) =>
            current.map((event) => (event.id === last.sourceId ? { ...event, recordedAt: last.previousValue } : event))
          );
        }
        if (last.key === 'startOfPlayTime' || last.key === 'startOfSleepTime') {
          setEvents((current) =>
            current.map((event) => (event.id === last.sourceId ? { ...event, recordedAt: last.previousValue } : event))
          );
        }
        if (last.key === 'urine' || last.key === 'stool' || last.key === 'remarks') {
          setEvents((current) => current.map((event) => (event.id === last.sourceId ? { ...event, label: last.previousValue } : event)));
        }
      } else if (last.sourceType === 'feed-session') {
        setFeedSessions((current) =>
          current.map((session) =>
            session.id === last.sourceId ? { ...session, startedAt: last.previousValue } : session
          )
        );
      }
    }
    if (last.action !== 'PROJECT_CELL') {
      setSelectedTimelineItem((current) => (current?.id === last.item.id ? last.item : current));
    }
    setUndoStack((current) => current.slice(1));
    setCorrectionHistory((current) => [
      {
        id: `correction.undo:${'item' in last ? last.item.sourceId : last.sourceId}:${current.length + 1}`,
        action: 'correction.undo',
        sourceId: 'item' in last ? last.item.sourceId : last.sourceId,
        sourceType: 'item' in last ? last.item.sourceType : last.sourceType,
        createdAt: new Date().toISOString(),
        summary:
          'item' in last
            ? `Undid ${last.action.toLowerCase().replaceAll('_', ' ')} for ${last.item.title}`
            : `Undid ${last.action.toLowerCase().replaceAll('_', ' ')} for ${String(last.key)}`
      },
      ...current
    ]);
  }

  async function startFeedSession(mode: FeedSessionMode) {
    const response = await fetch(feedsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, babyId: 'current-baby' })
    });
    const payload = await parseJsonResponse<{ session?: FeedSessionDTO }>(response, 'feed-sessions');
    if (payload.session) {
      setFeedSessions((current) => [payload.session!, ...current]);
    }
  }

  async function addFeedSegment(sessionId: string, kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE') {
    const response = await fetch(new URL(`/feed-sessions/${sessionId}/segments`, window.location.origin), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, label: kind.toLowerCase() })
    });
    const payload = await parseJsonResponse<{ session?: FeedSessionDTO }>(response, 'feed-session-segments');
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
    }
  }

  async function closeFeedSession(sessionId: string) {
    const response = await fetch(new URL(`/feed-sessions/${sessionId}`, window.location.origin), {
      method: 'PATCH'
    });
    const payload = await parseJsonResponse<{ session?: FeedSessionDTO }>(response, 'feed-sessions');
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
    }
  }

  async function importFeedDuration(sessionId: string, durationMinutes: number) {
    const response = await fetch(new URL(`/feed-sessions/${sessionId}`, window.location.origin), {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ durationMinutes })
    });
    const payload = await parseJsonResponse<{ session?: FeedSessionDTO }>(response, 'feed-sessions');
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
    }
  }

  async function recordIntervention(kind: InterventionAttemptKind, outcome?: InterventionAttemptOutcome) {
    const optimisticIntervention: InterventionAttemptDTO = {
      id: `optimistic_intervention_${kind.toLowerCase()}_${Date.now()}`,
      babyId: 'current-baby',
      kind,
      label: kind.toLowerCase().replaceAll('_', ' '),
      outcome: outcome ?? 'UNKNOWN',
      context: 'today',
      recordedAt: new Date().toISOString()
    };
    setInterventionAttempts((current) => [optimisticIntervention, ...current]);
    const response = await fetch(interventionsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind,
        label: kind.toLowerCase().replaceAll('_', ' '),
        outcome,
        babyId: 'current-baby',
        context: 'today'
      })
    });
    const payload = await parseJsonResponse<{ intervention?: InterventionAttemptDTO }>(response, 'interventions');
    if (payload.intervention) {
      setInterventionAttempts((current) =>
        current.map((attempt) => (attempt.id === optimisticIntervention.id ? payload.intervention! : attempt))
      );
    }
  }

  return (
    <MobileShell>
      <PageShell
        title="Today / 今天"
        subtitle="Current cycle"
        testId="today-page"
        className="today-page"
        actions={
          <>
            <div className="view-mode-switcher" role="group" aria-label="View mode switcher" data-testid="view-mode-switcher">
              <button type="button" aria-pressed={viewMode === 'timeline'} onClick={() => setViewMode('timeline')}>
                Timeline / 时间线
              </button>
              <button type="button" aria-pressed={viewMode === 'journal'} onClick={() => setViewMode('journal')}>
                Journal / 记录表
              </button>
              <button type="button" aria-pressed={viewMode === 'compact'} onClick={() => setViewMode('compact')}>
                Compact / 简洁
              </button>
            </div>
            <div className="page-hero-actions-row">
              <Link to="/profile" className="today-profile-link">
                Profile / 资料
              </Link>
              <Link to="/guide" className="today-guide-link">
                Guide / 说明
              </Link>
            </div>
          </>
        }
      >
        {viewMode === 'journal' ? (
          <PaperJournalView
            rows={[rowViewModel]}
            onEditCell={(key, label, value) => {
              setPaperJournalReason('');
              setPaperJournalEditor(resolveCellEditorState(key, label, value));
            }}
          />
        ) : viewMode === 'compact' ? (
          <section className="timeline-card panel-stack" data-testid="compact-journal">
            <p className="paper-heading">Compact journal</p>
            <JournalRowSummary
              row={rowViewModel}
              onEditCell={(key, label, value) => {
                setCompactBlockReason('');
                setCompactBlockEditor(resolveCellEditorState(key, label, value));
              }}
            />
            <p className="status-chip compact-mode" data-testid="compact-mode" data-compact-mode="on">
              Compact journal active.
            </p>
          </section>
        ) : (
          <>
            <section className="timeline-card panel-stack">
              <p className="paper-heading">Current cycle summary</p>
              <JournalRowSummary
                row={rowViewModel}
                onEditCell={(key, label, value) => {
                  setPaperJournalReason('');
                  setPaperJournalEditor(resolveCellEditorState(key, label, value));
                }}
              />
              <button type="button" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen}>
                {detailsOpen ? 'Hide row details' : 'View row details'}
              </button>
              <p className="status-chip compact-mode" data-testid="compact-mode" data-compact-mode={viewMode === 'compact' ? 'on' : 'off'}>
                Timeline view active.
              </p>
            </section>
            <LiveTimelineStream items={timelineItems} onSelect={(item) => setSelectedTimelineItem(item)} />
            <NeedsReviewBanner count={needsReviewCount} />
            <ClusterReviewPanel
              clusters={timelineClusters}
              onMarkReviewed={(clusterId) => setReviewedClusterIds((current) => (current.includes(clusterId) ? current : [...current, clusterId]))}
            />
            <CorrectionHistoryPanel items={correctionHistory} onRestoreItem={restoreCorrectionFromHistory} />
            {selectedTimelineItem ? (
              <TimelineDetailSheet
                item={selectedTimelineItem}
                onClose={() => setSelectedTimelineItem(null)}
                onEditTime={() => {
                  setTimelineEditReason('');
                  setTimelineEditor({ item: selectedTimelineItem, mode: 'time' });
                }}
                onEditDetails={() => {
                  setTimelineEditReason('');
                  setTimelineEditor({ item: selectedTimelineItem, mode: 'details' });
                }}
                onDelete={() => softDeleteTimelineItem(selectedTimelineItem, timelineEditReason)}
                onMergeDuplicate={() => mergeDuplicateTimelineItem(selectedTimelineItem, timelineEditReason)}
                onUndo={undoLastAction}
              />
            ) : null}
            <QuickActionDock
              onAction={(action) => {
                if (action === 'Wake') {
                  void recordEvent('WAKE');
                }
                if (action === 'Feed') {
                  void startFeedSession('BREAST');
                }
                if (action === 'Play') {
                  void recordEvent('PLAY');
                }
                if (action === 'Diaper') {
                  void recordEvent('DIAPER');
                }
                if (action === 'Note') {
                  void recordEvent('NOTE');
                }
                if (action === 'More') {
                  setDetailsOpen(true);
                }
              }}
            />
            {detailsOpen ? (
              <section className="panel-stack" aria-label="Row details" data-testid="row-details">
                <EventLog events={events} />
                <InterventionAttemptsPanel attempts={interventionAttempts} onRecordAttempt={(kind, outcome) => void recordIntervention(kind, outcome)} />
                <StateTransitionViewer transitions={derivedBabyStateTransitions} />
                <FeedSessionsPanel
                  sessions={feedSessions}
                  now={now}
                  onStartSession={startFeedSession}
                  onAddSegment={addFeedSegment}
                  onCloseSession={closeFeedSession}
                  onImportDuration={importFeedDuration}
                />
              </section>
            ) : null}
          </>
        )}
        {paperJournalEditor ? (
          <PaperJournalCellEditSheet
            title={paperJournalEditor.label}
            currentValue={paperJournalEditor.value}
            currentSource={rowViewModel[paperJournalEditor.key].source}
            suggestedReason={suggestedReasonForCell(paperJournalEditor)}
            selectedReason={paperJournalReason}
            onUseSuggestedReason={() => setPaperJournalReason(suggestedReasonForCell(paperJournalEditor))}
            onReasonChange={(reason) => setPaperJournalReason(reason as CorrectionReason)}
            onSave={(nextValue) => {
              updateJournalProjectionCell(paperJournalEditor.key, nextValue, paperJournalReason);
              setPaperJournalEditor(null);
              setPaperJournalReason('');
            }}
            onDelete={() => {
              deleteJournalProjectionCell(paperJournalEditor, paperJournalReason);
              setPaperJournalEditor(null);
              setPaperJournalReason('');
            }}
            onMergeDuplicate={() => {
              mergeJournalProjectionCell(paperJournalEditor, paperJournalReason);
              setPaperJournalEditor(null);
              setPaperJournalReason('');
            }}
            onRestore={() => {
              undoLastAction();
              setPaperJournalEditor(null);
              setPaperJournalReason('');
            }}
            onClose={() => setPaperJournalEditor(null)}
          />
        ) : null}
        {compactBlockEditor ? (
          <CompactBlockDetailSheet
            title={compactBlockEditor.label}
            currentValue={compactBlockEditor.value}
            currentSource={rowViewModel[compactBlockEditor.key].source}
            suggestedReason={suggestedReasonForCell(compactBlockEditor)}
            selectedReason={compactBlockReason}
            onUseSuggestedReason={() => setCompactBlockReason(suggestedReasonForCell(compactBlockEditor))}
            onReasonChange={(reason) => setCompactBlockReason(reason as CorrectionReason)}
            onSave={(nextValue) => {
              updateJournalProjectionCell(compactBlockEditor.key, nextValue, compactBlockReason);
              setCompactBlockEditor(null);
              setCompactBlockReason('');
            }}
            onDelete={() => {
              deleteJournalProjectionCell(compactBlockEditor, compactBlockReason);
              setCompactBlockEditor(null);
              setCompactBlockReason('');
            }}
            onMergeDuplicate={() => {
              mergeJournalProjectionCell(compactBlockEditor, compactBlockReason);
              setCompactBlockEditor(null);
              setCompactBlockReason('');
            }}
            onRestore={() => {
              undoLastAction();
              setCompactBlockEditor(null);
              setCompactBlockReason('');
            }}
            onClose={() => setCompactBlockEditor(null)}
          />
        ) : null}
        {timelineEditor ? (
          <TimelineEditSheet
            title={timelineEditor.item.title}
            label={timelineEditor.mode === 'time' ? 'Update time' : 'Update details'}
            currentValue={timelineEditor.mode === 'time' ? timelineEditor.item.recordedAt : timelineEditor.item.details}
            suggestedReason={suggestedReasonForTimelineEdit(timelineEditor.item)}
            selectedReason={timelineEditReason}
            onUseSuggestedReason={() => setTimelineEditReason(suggestedReasonForTimelineEdit(timelineEditor.item))}
            onReasonChange={(reason) => setTimelineEditReason(reason as CorrectionReason)}
            onSave={(nextValue) => {
              if (timelineEditor.mode === 'time') {
                updateTimelineItemTime(timelineEditor.item, nextValue, timelineEditReason);
              } else {
                updateTimelineItemDetails(timelineEditor.item, nextValue, timelineEditReason);
              }
              setTimelineEditor(null);
              setTimelineEditReason('');
            }}
            onClose={() => {
              setTimelineEditor(null);
              setTimelineEditReason('');
            }}
          />
        ) : null}
      </PageShell>
    </MobileShell>
  );
}
