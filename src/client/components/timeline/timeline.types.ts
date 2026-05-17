import type { CycleEventDTO } from '../../../domain/event/event.types';
import type { FeedSessionDTO, FeedSegmentDTO } from '../../../domain/feed/feed.types';

export type TimelineItemKind = 'CYCLE_EVENT' | 'FEED_SESSION_START' | 'FEED_SEGMENT' | 'FEED_SESSION_END';

export type TimelineItemDTO = {
  id: string;
  kind: TimelineItemKind;
  title: string;
  details: string;
  recordedAt: string;
  sourceId: string;
  sourceType: 'cycle-event' | 'feed-session' | 'feed-segment';
};

export type TimelineSelection = TimelineItemDTO | null;

export type TimelineSource = {
  events: CycleEventDTO[];
  feedSessions: FeedSessionDTO[];
};

export type TimelineSourceRecord =
  | { type: 'cycle-event'; event: CycleEventDTO }
  | { type: 'feed-session-start'; session: FeedSessionDTO }
  | { type: 'feed-segment'; session: FeedSessionDTO; segment: FeedSegmentDTO }
  | { type: 'feed-session-end'; session: FeedSessionDTO };
