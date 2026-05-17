import { describe, expect, it } from 'vitest';
import type { BabyStateTransitionDTO } from '../src/domain/baby-state/baby-state.types';
import type { CycleEventDTO } from '../src/domain/event/event.types';
import type { FeedSessionDTO } from '../src/domain/feed/feed.types';
import { buildPaperJournalRowViewModel } from '../src/client/components/journal/paper-journal-view-model';

describe('paper journal view model', () => {
  it('projects paper journal columns from event and feed data', () => {
    const events: CycleEventDTO[] = [
      { id: 'event_2', kind: 'PLAY', label: 'play', babyId: 'baby_1', recordedAt: '2026-05-16T00:10:00.000Z' },
      { id: 'event_1', kind: 'WAKE', label: 'wake', babyId: 'baby_1', recordedAt: '2026-05-16T00:00:00.000Z' },
      { id: 'event_3', kind: 'NOTE', label: 'settled quickly', babyId: 'baby_1', recordedAt: '2026-05-16T00:15:00.000Z' }
    ];
    const sessions: FeedSessionDTO[] = [
      {
        id: 'feed_session_1',
        babyId: 'baby_1',
        mode: 'BREAST',
        startedAt: '2026-05-16T00:05:00.000Z',
        durationMinutes: 18,
        durationSource: 'MANUAL',
        segments: [
          { id: 'segment_1', kind: 'LEFT', label: 'left', recordedAt: '2026-05-16T00:05:00.000Z' },
          { id: 'segment_2', kind: 'RIGHT', label: 'right', recordedAt: '2026-05-16T00:12:00.000Z' }
        ]
      }
    ];
    const transitions: BabyStateTransitionDTO[] = [
      {
        id: 'transition_1',
        babyId: 'baby_1',
        fromState: 'AWAKE_CALM',
        toState: 'CRYING',
        confidence: 'CONFIRMED',
        recordedAt: '2026-05-16T00:00:00.000Z',
        sourceType: 'cycle-event',
        sourceId: 'event_1',
        triggerLabel: 'cry',
        triggerKind: 'CRY'
      }
    ];

    const row = buildPaperJournalRowViewModel(events, sessions, [], transitions);

    expect(row.wakeUpTime.display).not.toBe('—');
    expect(row.startOfFeedTime.display).not.toBe('—');
    expect(row.feedSummary.display).toContain('Breast feed');
    expect(row.feedSummary.display).toContain('LB');
    expect(row.feedSummary.display).toContain('RB');
    expect(row.feedSummary.display).toContain('Imported 18m');
    expect(row.startOfPlayTime.display).not.toBe('—');
    expect(row.remarks.display).toContain('settled quickly');
    expect(row.details.timelineEventIds).toEqual(['event_2', 'event_1', 'event_3']);
    expect(row.details.feedSessionIds).toEqual(['feed_session_1']);
    expect(row.details.stateTransitionIds).toEqual(['transition_1']);
  });
});
