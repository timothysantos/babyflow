import type { CycleEventDTO } from '../../../domain/event/event.types';
import type { FeedSessionDTO } from '../../../domain/feed/feed.types';
import type { TimelineItemDTO, TimelineSourceRecord } from './timeline.types';
import { formatSingaporeDateTime } from '../../lib/singapore-time';

function parseTime(recordedAt: string) {
  return new Date(recordedAt).getTime();
}

function formatLabel(event: CycleEventDTO) {
  return `${event.kind.toLowerCase().replaceAll('_', ' ')} · ${event.label}`;
}

function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

function formatSessionLabel(session: FeedSessionDTO, now: Date) {
  const durationMinutes =
    session.durationMinutes ??
    (session.endedAt
      ? Math.max(0, Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000))
      : Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 60000)));
  const durationLabel =
    session.durationMinutes != null
      ? `${session.durationSource === 'MANUAL' ? 'Imported' : 'Closed'} ${formatDuration(durationMinutes)}`
      : session.endedAt
        ? `Closed ${formatDuration(durationMinutes)}`
        : `Live ${formatDuration(durationMinutes)}`;
  return `${session.mode} feed · ${session.babyId} · ${durationLabel}`;
}

function formatSessionSummary(session: FeedSessionDTO, now: Date) {
  const durationMinutes =
    session.durationMinutes ??
    (session.endedAt
      ? Math.max(0, Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000))
      : Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 60000)));
  const durationLabel =
    session.durationMinutes != null
      ? `${session.durationSource === 'MANUAL' ? 'Imported' : 'Closed'} ${formatDuration(durationMinutes)}`
      : session.endedAt
        ? `Closed ${formatDuration(durationMinutes)}`
        : `Live ${formatDuration(durationMinutes)}`;
  return `${session.mode} · ${durationLabel}`;
}

function formatFeedSegmentTitle(kind: string) {
  if (kind === 'LEFT') return 'left breastfeeding';
  if (kind === 'RIGHT') return 'right breastfeeding';
  if (kind === 'BOTTLE') return 'formula';
  return kind.toLowerCase().replaceAll('_', ' ');
}

export function buildTimelineItems(events: CycleEventDTO[], sessions: FeedSessionDTO[], now: Date = new Date()): TimelineItemDTO[] {
  const records: TimelineSourceRecord[] = [
    ...events.map((event) => ({ type: 'cycle-event', event }) as const),
    ...sessions.flatMap((session) => [
      { type: 'feed-session-start', session } as const,
      ...session.segments.map((segment) => ({ type: 'feed-segment', session, segment }) as const),
      ...(session.endedAt ? [{ type: 'feed-session-end', session } as const] : [])
    ])
  ];

  return records
    .map((record) => {
      if (record.type === 'cycle-event') {
        return {
          id: `cycle-event:${record.event.id}`,
          kind: 'CYCLE_EVENT' as const,
          title: record.event.kind.toLowerCase().replaceAll('_', ' '),
          details: record.event.label,
          recordedAt: record.event.recordedAt,
          sourceId: record.event.id,
          sourceType: 'cycle-event' as const
        };
      }

      if (record.type === 'feed-session-start') {
        return {
          id: `feed-session-start:${record.session.id}`,
          kind: 'FEED_SESSION_START' as const,
          title: 'feed session',
          details: `${record.session.babyId} · ${formatSessionSummary(record.session, now)}`,
          recordedAt: record.session.startedAt,
          sourceId: record.session.id,
          sourceType: 'feed-session' as const
        };
      }

      if (record.type === 'feed-session-end') {
        return {
          id: `feed-session-end:${record.session.id}`,
          kind: 'FEED_SESSION_END' as const,
          title: 'feed session',
          details: `${record.session.babyId} · ${formatSessionSummary(record.session, now)}`,
          recordedAt: record.session.endedAt ?? record.session.startedAt,
          sourceId: record.session.id,
          sourceType: 'feed-session' as const
        };
      }

      return {
        id: `feed-segment:${record.session.id}:${record.segment.id}`,
        kind: 'FEED_SEGMENT' as const,
        title: formatFeedSegmentTitle(record.segment.kind),
        details: `${record.session.mode} · ${record.segment.label} · ${record.session.babyId} · ${formatSessionSummary(record.session, now)}`,
        recordedAt: record.segment.recordedAt,
        sourceId: record.segment.id,
        sourceType: 'feed-segment' as const
      };
    })
    .sort((left, right) => parseTime(right.recordedAt) - parseTime(left.recordedAt))
    .map((item) => ({ ...item, recordedAt: formatSingaporeDateTime(item.recordedAt) }));
}
