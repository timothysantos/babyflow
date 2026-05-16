import type { FeedSessionDTO, FeedSessionMode } from '../../../domain/feed/feed.types';

type Props = {
  sessions: FeedSessionDTO[];
  onStartSession: (mode: FeedSessionMode) => void;
  onAddSegment: (sessionId: string, kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE') => void;
  onCloseSession: (sessionId: string) => void;
};

const modes: Array<{ mode: FeedSessionMode; label: string }> = [
  { mode: 'BREAST', label: 'Breast' },
  { mode: 'EBM', label: 'EBM' },
  { mode: 'FORMULA', label: 'Formula' },
  { mode: 'MIXED', label: 'Mixed' }
];

const segments: Array<{ kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE'; label: string }> = [
  { kind: 'LEFT', label: 'Left' },
  { kind: 'RIGHT', label: 'Right' },
  { kind: 'BOTTLE', label: 'Bottle' },
  { kind: 'NOTE', label: 'Note' }
];

export function FeedSessionsPanel({ sessions, onStartSession, onAddSegment, onCloseSession }: Props) {
  return (
    <section aria-label="Feed sessions" data-testid="feed-sessions">
      <div role="group" aria-label="Start feed session">
        {modes.map((entry) => (
          <button key={entry.mode} type="button" onClick={() => onStartSession(entry.mode)}>
            Start {entry.label}
          </button>
        ))}
      </div>
      <ol data-testid="feed-session-list">
        {sessions.map((session) => (
          <li key={session.id} data-testid="feed-session-item">
            <p>
              {session.mode} feed for {session.babyId}
            </p>
            <p data-testid="feed-session-status">{session.endedAt ? 'Closed' : 'Open'}</p>
            <div role="group" aria-label={`Feed segments for ${session.id}`}>
              {segments.map((segment) => (
                <button key={segment.kind} type="button" onClick={() => onAddSegment(session.id, segment.kind)}>
                  Add {segment.label}
                </button>
              ))}
              <button type="button" onClick={() => onCloseSession(session.id)}>
                Close feed
              </button>
            </div>
            <ul>
              {session.segments.map((segment) => (
                <li key={segment.id} data-testid="feed-segment-item">
                  {segment.kind}: {segment.label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
