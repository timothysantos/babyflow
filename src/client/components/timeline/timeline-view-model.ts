import type { CycleEventDTO } from '../../../domain/event/event.types';
import type { FeedSessionDTO } from '../../../domain/feed/feed.types';
import type { TimelineItemDTO, TimelineSourceRecord } from './timeline.types';

function parseTime(recordedAt: string) {
  return new Date(recordedAt).getTime();
}

function formatLabel(event: CycleEventDTO) {
  return `${event.kind.toLowerCase().replaceAll('_', ' ')} · ${event.label}`;
}

function formatSessionLabel(session: FeedSessionDTO) {
  return `${session.mode} feed · ${session.babyId}`;
}

export function buildTimelineItems(events: CycleEventDTO[], sessions: FeedSessionDTO[]): TimelineItemDTO[] {
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
          title: 'feed session started',
          details: formatSessionLabel(record.session),
          recordedAt: record.session.startedAt,
          sourceId: record.session.id,
          sourceType: 'feed-session' as const
        };
      }

      if (record.type === 'feed-session-end') {
        return {
          id: `feed-session-end:${record.session.id}`,
          kind: 'FEED_SESSION_END' as const,
          title: 'feed session closed',
          details: formatSessionLabel(record.session),
          recordedAt: record.session.endedAt ?? record.session.startedAt,
          sourceId: record.session.id,
          sourceType: 'feed-session' as const
        };
      }

      return {
        id: `feed-segment:${record.session.id}:${record.segment.id}`,
        kind: 'FEED_SEGMENT' as const,
        title: record.segment.kind.toLowerCase().replaceAll('_', ' '),
        details: `${record.segment.label} · ${formatSessionLabel(record.session)}`,
        recordedAt: record.segment.recordedAt,
        sourceId: record.segment.id,
        sourceType: 'feed-segment' as const
      };
    })
    .sort((left, right) => parseTime(right.recordedAt) - parseTime(left.recordedAt));
}
