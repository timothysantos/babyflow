import type { FeedSessionDTO, FeedSessionMode } from '../../../domain/feed/feed.types';
import { useMemo, useState } from 'react';

type Props = {
  sessions: FeedSessionDTO[];
  now: number;
  onStartSession: (mode: FeedSessionMode) => void;
  onAddSegment: (sessionId: string, kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE', label?: string) => void;
  onCloseSession: (sessionId: string) => void;
  onImportDuration: (sessionId: string, durationMinutes: number) => void;
};

const modes: Array<{ mode: FeedSessionMode; label: string }> = [
  { mode: 'BREAST', label: 'Nurse' },
  { mode: 'EBM', label: 'Expressed milk' },
  { mode: 'FORMULA', label: 'Formula' },
  { mode: 'MIXED', label: 'Mixed feed' }
];

const segments: Array<{ kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE'; label: string }> = [
  { kind: 'LEFT', label: 'Left latch' },
  { kind: 'RIGHT', label: 'Right latch' },
  { kind: 'BOTTLE', label: 'Bottle top-up' },
  { kind: 'NOTE', label: 'Feed note' }
];

function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}

function formatElapsed(startedAt: string, now: number) {
  const elapsedMs = Math.max(0, now - new Date(startedAt).getTime());
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getDraftDurationMinutes(session: FeedSessionDTO, now: number) {
  if (session.durationMinutes != null) return session.durationMinutes;
  const end = session.endedAt ? new Date(session.endedAt).getTime() : now;
  return Math.max(1, Math.round((end - new Date(session.startedAt).getTime()) / 60000));
}

export function FeedSessionsPanel({ sessions, now, onStartSession, onAddSegment, onCloseSession, onImportDuration }: Props) {
  const [durationEditorSessionId, setDurationEditorSessionId] = useState<string | null>(null);
  const [durationDraft, setDurationDraft] = useState<string>('15');
  const [noteEditorSessionId, setNoteEditorSessionId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const activeSessionCount = useMemo(() => sessions.filter((session) => !session.endedAt).length, [sessions]);

  return (
    <section className="timeline-card panel-stack" aria-label="Feed sessions" data-testid="feed-sessions">
      <p className="paper-heading">Feeds</p>
      <p data-testid="feed-session-count">{activeSessionCount > 0 ? `${activeSessionCount} live session${activeSessionCount === 1 ? '' : 's'}` : 'No live feed sessions'}</p>
      <div role="group" aria-label="Start feed session" className="panel-stack">
        {modes.map((entry) => (
          <button key={entry.mode} type="button" onClick={() => onStartSession(entry.mode)}>
            Start {entry.label}
          </button>
        ))}
      </div>
      <ol className="timeline-list" data-testid="feed-session-list">
        {sessions.map((session) => (
          <li key={session.id} className="timeline-item" data-testid="feed-session-item">
            <p className="paper-heading">
              {session.mode} feed · {session.babyId}
            </p>
            <p className="status-chip" data-testid="feed-session-status">
              {session.durationMinutes != null
                ? `${session.durationSource === 'MANUAL' ? 'Imported' : 'Closed'} · ${formatDuration(session.durationMinutes)}`
                : session.endedAt
                  ? `Closed session · ${formatElapsed(session.startedAt, new Date(session.endedAt).getTime())}`
                  : `Live · ${formatElapsed(session.startedAt, now)}`
              }
            </p>
            <div role="group" aria-label={`Feed segments for ${session.id}`} className="panel-stack">
              {segments.map((segment) => (
                <button
                  key={segment.kind}
                  type="button"
                  onClick={() => {
                    if (segment.kind === 'NOTE') {
                      setNoteEditorSessionId(session.id);
                      setNoteDraft('');
                      return;
                    }
                    onAddSegment(session.id, segment.kind);
                  }}
                >
                  Add {segment.label}
                </button>
              ))}
              <button type="button" onClick={() => {
                setDurationEditorSessionId(session.id);
                setDurationDraft(String(getDraftDurationMinutes(session, now)));
              }}>
                Import duration
              </button>
              <button type="button" onClick={() => onCloseSession(session.id)}>
                Close session
              </button>
            </div>
            {durationEditorSessionId === session.id ? (
              <div className="timeline-card panel-stack" data-testid="feed-duration-editor">
                <label htmlFor={`feed-duration-${session.id}`} className="paper-heading">
                  Feed duration (minutes)
                </label>
                <input
                  id={`feed-duration-${session.id}`}
                  data-testid="feed-duration-input"
                  type="number"
                  min={1}
                  step={1}
                  value={durationDraft}
                  onChange={(event) => setDurationDraft(event.target.value)}
                />
                <div className="panel-stack">
                  <button
                    type="button"
                    onClick={() => {
                      onImportDuration(session.id, Number(durationDraft));
                      setDurationEditorSessionId(null);
                    }}
                  >
                    Save duration
                  </button>
                  <button type="button" onClick={() => setDurationEditorSessionId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            {noteEditorSessionId === session.id ? (
              <div className="timeline-card panel-stack" data-testid="feed-note-editor">
                <label htmlFor={`feed-note-${session.id}`} className="paper-heading">
                  Feed note
                </label>
                <textarea
                  id={`feed-note-${session.id}`}
                  data-testid="feed-note-input"
                  rows={4}
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  placeholder="What happened during this feed?"
                />
                <div className="panel-stack">
                  <button
                    type="button"
                    className="action-primary"
                    onClick={() => {
                      const nextLabel = noteDraft.trim() || 'feed note';
                      onAddSegment(session.id, 'NOTE', nextLabel);
                      setNoteEditorSessionId(null);
                    }}
                  >
                    Save note
                  </button>
                  <button type="button" onClick={() => setNoteEditorSessionId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            <ul className="stack-list">
              {session.segments.map((segment) => (
                <li key={segment.id} className="timeline-item" data-testid="feed-segment-item">
                  <span className="paper-heading">{segment.kind}</span>
                  <span className="timeline-item-label">{segment.label}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
