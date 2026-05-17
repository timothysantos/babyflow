export type FeedSessionMode = 'BREAST' | 'EBM' | 'FORMULA' | 'MIXED';
export type FeedDurationSource = 'LIVE' | 'MANUAL';

export type FeedSegmentKind = 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE';

export type FeedSegmentDraft = {
  kind: FeedSegmentKind;
  label: string;
};

export type FeedSegmentDTO = {
  id: string;
  kind: FeedSegmentKind;
  label: string;
  recordedAt: string;
};

export type FeedSessionDraft = {
  babyId: string;
  mode: FeedSessionMode;
};

export type FeedSessionDTO = {
  id: string;
  babyId: string;
  mode: FeedSessionMode;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  durationSource?: FeedDurationSource;
  segments: FeedSegmentDTO[];
};
