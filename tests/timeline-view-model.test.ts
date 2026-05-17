import { describe, expect, it } from 'vitest';
import { buildTimelineItems } from '../src/client/components/timeline/timeline-view-model';

describe('timeline view model', () => {
  it('renders a chronological stream across events and feed sessions', () => {
    const items = buildTimelineItems(
      [
        {
          id: 'event_1',
          kind: 'WAKE',
          label: 'wake',
          recordedAt: '2026-05-16T00:00:00.000Z'
        },
        {
          id: 'event_2',
          kind: 'PLAY',
          label: 'play',
          recordedAt: '2026-05-16T00:05:00.000Z'
        }
      ],
      [
        {
          id: 'feed_session_1',
          babyId: 'baby_1',
          mode: 'BREAST',
          startedAt: '2026-05-16T00:02:00.000Z',
          endedAt: '2026-05-16T00:12:00.000Z',
          segments: [
            {
              id: 'feed_segment_1',
              kind: 'LEFT',
              label: 'left',
              recordedAt: '2026-05-16T00:03:00.000Z'
            }
          ]
        }
      ]
    );

    expect(items.map((item) => item.id)).toEqual([
      'feed-session-end:feed_session_1',
      'cycle-event:event_2',
      'feed-segment:feed_session_1:feed_segment_1',
      'feed-session-start:feed_session_1',
      'cycle-event:event_1'
    ]);
  });
});
