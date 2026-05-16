import type { CycleEventDTO } from '../../../domain/event/event.types';
import type { FeedSessionDTO } from '../../../domain/feed/feed.types';
import type { JournalCellValue, PaperJournalRowViewModel } from './paper-journal.types';

function formatClock(timestamp?: string) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(date);
}

function cell(display: string, source: JournalCellValue['source'], needsReview = false): JournalCellValue {
  return {
    display,
    source,
    confidence: needsReview ? 'UNSURE' : source === 'MISSING' ? 'UNSURE' : 'CONFIRMED',
    needsReview
  };
}

function emptyCell(): JournalCellValue {
  return cell('—', 'MISSING', true);
}

function joinLabels(values: string[]) {
  return values.length > 0 ? values.join(' · ') : '—';
}

export function buildPaperJournalRowViewModel(
  events: CycleEventDTO[],
  sessions: FeedSessionDTO[]
): PaperJournalRowViewModel {
  const wakeEvent = events.find((event) => event.kind === 'WAKE');
  const playEvent = events.find((event) => event.kind === 'PLAY');
  const sleepEvent = events.find((event) => event.kind === 'ASLEEP');
  const putDownEvent = events.find((event) => event.kind === 'PUT_DOWN');
  const notes = events.filter((event) => event.kind === 'NOTE').map((event) => event.label);
  const diaperEvents = events.filter((event) => event.kind === 'DIAPER');
  const feedSession = sessions[0];
  const feedSegments = feedSession?.segments ?? [];
  const feedSegmentSummary =
    feedSegments.length > 0
      ? joinLabels(
          feedSegments.map((segment) =>
            segment.kind === 'LEFT'
              ? 'LB'
              : segment.kind === 'RIGHT'
                ? 'RB'
                : segment.kind === 'BOTTLE'
                  ? 'Bottle'
                  : segment.label
          )
        )
      : null;

  const feedSummary = feedSession
    ? cell(
        [feedSession.mode === 'BREAST' ? 'Breast feed' : feedSession.mode, feedSegmentSummary]
          .filter(Boolean)
          .join(' · '),
        'EVENT'
      )
    : emptyCell();

  return {
    cycleId: wakeEvent?.babyId ?? feedSession?.babyId ?? 'current-baby',
    rowStatus: events.length > 0 || sessions.length > 0 ? (sleepEvent?.recordedAt || feedSession?.endedAt ? 'COMPLETE' : 'ACTIVE') : 'NEEDS_REVIEW',
    wakeUpTime: wakeEvent ? cell(formatClock(wakeEvent.recordedAt), 'EVENT') : emptyCell(),
    startOfFeedTime: feedSession ? cell(formatClock(feedSession.startedAt), 'EVENT') : emptyCell(),
    feedSummary,
    startOfPlayTime: playEvent ? cell(formatClock(playEvent.recordedAt), 'EVENT') : emptyCell(),
    startOfSleepTime: sleepEvent
      ? cell(formatClock(sleepEvent.recordedAt), 'EVENT')
      : putDownEvent
        ? cell(formatClock(putDownEvent.recordedAt), 'EVENT', true)
        : emptyCell(),
    sleepDuration: sleepEvent && wakeEvent ? cell('—', 'DERIVED', true) : emptyCell(),
    urine:
      diaperEvents.find((event) => event.label.toLowerCase().includes('urine')) != null
        ? cell('Urine noted', 'EVENT')
        : emptyCell(),
    stool:
      diaperEvents.find((event) => event.label.toLowerCase().includes('stool')) != null
        ? cell('Stool noted', 'EVENT')
        : emptyCell(),
    remarks:
      notes.length > 0
        ? cell(notes.join(' · '), 'EVENT')
        : feedSegments.length > 0
          ? cell(`${feedSegments.length} feed stamps`, 'EVENT')
          : emptyCell(),
    details: {
      timelineEventIds: events.map((event) => event.id),
      feedSessionIds: sessions.map((session) => session.id),
      interventionAttemptIds: events.filter((event) => event.kind === 'BURP' || event.kind === 'NOTE').map((event) => event.id),
      diaperEventIds: diaperEvents.map((event) => event.id),
      stateTransitionIds: events.filter((event) => event.kind === 'PUT_DOWN' || event.kind === 'ASLEEP').map((event) => event.id)
    }
  };
}
