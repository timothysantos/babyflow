import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileShell } from '../layouts/MobileShell';
import { PageShell } from '../layouts/PageShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { EventLog } from '../components/events/EventLog';
import type { CycleEventDTO, CycleEventKind } from '../../domain/event/event.types';
import { FeedSessionsPanel } from '../components/feed/FeedSessionsPanel';
import type { FeedSessionDTO, FeedSessionMode } from '../../domain/feed/feed.types';
import { buildPaperJournalRowViewModel } from '../components/journal/paper-journal-view-model';
import { JournalRowSummary } from '../components/journal/JournalRowSummary';
import { PaperJournalView } from '../components/journal/PaperJournalView';
import { LiveTimelineStream } from '../components/timeline/LiveTimelineStream';
import { TimelineDetailSheet } from '../components/timeline/TimelineDetailSheet';
import { buildTimelineItems } from '../components/timeline/timeline-view-model';
import type { TimelineItemDTO } from '../components/timeline/timeline.types';

type TodayViewMode = 'timeline' | 'journal' | 'compact';
type UndoRecord =
  | { action: 'SOFT_DELETE'; item: TimelineItemDTO }
  | { action: 'UPDATE_TIME'; item: TimelineItemDTO; previousValue: string }
  | { action: 'UPDATE_DETAILS'; item: TimelineItemDTO; previousValue: string };

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

export function TodayPage() {
  const [viewMode, setViewMode] = useState<TodayViewMode>(() =>
    normalizeViewMode(window.localStorage.getItem('babyflow.today.viewMode') ?? window.localStorage.getItem('babyflow.today.compactMode'))
  );
  const [detailsOpen, setDetailsOpen] = useState(() => window.localStorage.getItem('babyflow.today.rowDetailsOpen') === 'true');
  const [events, setEvents] = useState<CycleEventDTO[]>([]);
  const [feedSessions, setFeedSessions] = useState<FeedSessionDTO[]>([]);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItemDTO | null>(null);
  const [correctionHistory, setCorrectionHistory] = useState<Array<{ action: string; sourceId: string }>>([]);
  const [undoStack, setUndoStack] = useState<UndoRecord[]>([]);

  const rowViewModel = useMemo(() => buildPaperJournalRowViewModel(events, feedSessions), [events, feedSessions]);
  const timelineItems = useMemo(() => buildTimelineItems(events, feedSessions), [events, feedSessions]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.viewMode', viewMode);
    window.localStorage.setItem('babyflow.today.compactMode', String(viewMode === 'compact'));
  }, [viewMode]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.rowDetailsOpen', String(detailsOpen));
  }, [detailsOpen]);

  useEffect(() => {
    void fetch(eventsUrl())
      .then((response) => response.json())
      .then((payload: { events?: CycleEventDTO[] }) =>
        setEvents((current) => (current.length > 0 ? current : payload.events ?? []))
      )
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    void fetch(feedsUrl())
      .then((response) => response.json())
      .then((payload: { sessions?: FeedSessionDTO[] }) =>
        setFeedSessions((current) => (current.length > 0 ? current : payload.sessions ?? []))
      )
      .catch(() => setFeedSessions([]));
  }, []);

  async function recordEvent(kind: CycleEventKind) {
    const response = await fetch(eventsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, label: kind.toLowerCase().replaceAll('_', ' '), babyId: 'current-baby' })
    });
    const payload = (await response.json()) as { event?: CycleEventDTO };
    if (payload.event) {
      setEvents((current) => [payload.event!, ...current]);
    }
  }

  function recordCorrection(action: string, sourceId: string) {
    setCorrectionHistory((current) => [{ action, sourceId }, ...current]);
  }

  function pushUndo(record: UndoRecord) {
    setUndoStack((current) => [record, ...current]);
  }

  function softDeleteTimelineItem(item: TimelineItemDTO) {
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
    recordCorrection('SOFT_DELETE', item.sourceId);
    setSelectedTimelineItem(null);
  }

  function updateTimelineItemTime(item: TimelineItemDTO) {
    const nextRecordedAt = window.prompt('Update time', item.recordedAt);
    if (!nextRecordedAt) return;
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
    recordCorrection('UPDATE_TIME', item.sourceId);
  }

  function updateTimelineItemDetails(item: TimelineItemDTO) {
    const nextDetails = window.prompt('Update details', item.details);
    if (!nextDetails) return;
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
    recordCorrection('UPDATE_DETAILS', item.sourceId);
  }

  function mergeDuplicateTimelineItem(item: TimelineItemDTO) {
    const duplicate = timelineItems.find((entry) => entry.id !== item.id && entry.title === item.title && entry.details === item.details);
    if (!duplicate) {
      window.alert('No duplicate timeline item found to merge.');
      return;
    }
    pushUndo({ action: 'SOFT_DELETE', item: duplicate });
    softDeleteTimelineItem(duplicate);
    recordCorrection('MERGE_DUPLICATE', duplicate.sourceId);
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
    setUndoStack((current) => current.slice(1));
    setCorrectionHistory((current) => current.slice(1));
  }

  async function startFeedSession(mode: FeedSessionMode) {
    const response = await fetch(feedsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, babyId: 'current-baby' })
    });
    const payload = (await response.json()) as { session?: FeedSessionDTO };
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
    const payload = (await response.json()) as { session?: FeedSessionDTO };
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
    }
  }

  async function closeFeedSession(sessionId: string) {
    const response = await fetch(new URL(`/feed-sessions/${sessionId}`, window.location.origin), {
      method: 'PATCH'
    });
    const payload = (await response.json()) as { session?: FeedSessionDTO };
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
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
            <Link to="/profile" className="today-profile-link">
              Profile / 资料
            </Link>
          </>
        }
      >
        {viewMode === 'journal' ? (
          <PaperJournalView rows={[rowViewModel]} />
        ) : viewMode === 'compact' ? (
          <section className="timeline-card panel-stack" data-testid="compact-journal">
            <p className="paper-heading">Compact journal</p>
            <JournalRowSummary row={rowViewModel} />
            <p className="status-chip compact-mode" data-testid="compact-mode" data-compact-mode="on">
              Compact journal active.
            </p>
          </section>
        ) : (
          <>
            <section className="timeline-card panel-stack">
              <p className="paper-heading">Current cycle summary</p>
              <JournalRowSummary row={rowViewModel} />
              <button type="button" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen}>
                {detailsOpen ? 'Hide row details' : 'View row details'}
              </button>
              <p className="status-chip compact-mode" data-testid="compact-mode" data-compact-mode={viewMode === 'compact' ? 'on' : 'off'}>
                Timeline view active.
              </p>
            </section>
            <LiveTimelineStream items={timelineItems} onSelect={(item) => setSelectedTimelineItem(item)} />
            {selectedTimelineItem ? (
              <TimelineDetailSheet
                item={selectedTimelineItem}
                onClose={() => setSelectedTimelineItem(null)}
                onEditTime={() => updateTimelineItemTime(selectedTimelineItem)}
                onEditDetails={() => updateTimelineItemDetails(selectedTimelineItem)}
                onDelete={() => softDeleteTimelineItem(selectedTimelineItem)}
                onMergeDuplicate={() => mergeDuplicateTimelineItem(selectedTimelineItem)}
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
                <FeedSessionsPanel
                  sessions={feedSessions}
                  onStartSession={startFeedSession}
                  onAddSegment={addFeedSegment}
                  onCloseSession={closeFeedSession}
                />
              </section>
            ) : null}
          </>
        )}
      </PageShell>
    </MobileShell>
  );
}
