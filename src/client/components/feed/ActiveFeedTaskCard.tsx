import { useState } from 'react';
import type { FeedSegmentDTO, FeedSessionDTO } from '../../../domain/feed/feed.types';

type Props = {
  session: FeedSessionDTO;
  now: number;
  onAddSegment: (sessionId: string, kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE') => void;
  onCloseSession: (sessionId: string) => void;
  onImportDuration: (sessionId: string, durationMinutes: number) => void;
};

const segmentActions: Array<{ kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE'; label: string }> = [
  { kind: 'LEFT', label: 'Left breast' },
  { kind: 'RIGHT', label: 'Right breast' },
  { kind: 'BOTTLE', label: 'Formula' },
  { kind: 'NOTE', label: 'Note' }
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

function getCurrentSegment(session: FeedSessionDTO): FeedSegmentDTO | null {
  return [...session.segments].sort((left, right) => new Date(right.recordedAt).getTime() - new Date(left.recordedAt).getTime())[0] ?? null;
}

function formatSegmentLabel(segment: FeedSegmentDTO | null) {
  if (!segment) return 'Feed started';
  if (segment.kind === 'LEFT') return 'Left breastfeeding';
  if (segment.kind === 'RIGHT') return 'Right breastfeeding';
  if (segment.kind === 'BOTTLE') return 'Formula';
  return 'Feed note';
}

function nextActionGuidance(segment: FeedSegmentDTO | null) {
  if (!segment) return 'Start with left, right, or formula. The card will keep the feed grouped as one session.';
  if (segment.kind === 'LEFT') return 'Left is running. Tap Right breast, Formula, or Close feed when this part changes.';
  if (segment.kind === 'RIGHT') return 'Right is running. Tap Left breast, Formula, or Close feed when this part changes.';
  if (segment.kind === 'BOTTLE') return 'Formula is running. Tap Left breast, Right breast, or Close feed if feeding continues.';
  return 'Note added. Tap the next feeding action when care continues.';
}

function getOrderedSegments(session: FeedSessionDTO) {
  return [...session.segments].sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
}

function segmentDuration(segment: FeedSegmentDTO, nextSegment: FeedSegmentDTO | undefined, session: FeedSessionDTO, now: number) {
  const end = nextSegment?.recordedAt ?? session.endedAt ?? new Date(now).toISOString();
  const duration = Math.max(0, Math.round((new Date(end).getTime() - new Date(segment.recordedAt).getTime()) / 60000));
  return duration === 0 ? '<1m' : formatDuration(duration);
}

export function ActiveFeedTaskCard({ session, now, onAddSegment, onCloseSession, onImportDuration }: Props) {
  const [durationEditorOpen, setDurationEditorOpen] = useState(false);
  const [durationDraft, setDurationDraft] = useState(() => String(getDraftDurationMinutes(session, now)));
  const currentSegment = getCurrentSegment(session);
  const currentSegmentStartedAt = currentSegment?.recordedAt ?? session.startedAt;
  const orderedSegments = getOrderedSegments(session);
  const status =
    session.durationMinutes != null
      ? `${session.durationSource === 'MANUAL' ? 'Imported' : 'Closed'} · ${formatDuration(session.durationMinutes)}`
      : session.endedAt
        ? `Closed · ${formatElapsed(session.startedAt, new Date(session.endedAt).getTime())}`
        : `Live · ${formatElapsed(session.startedAt, now)}`;

  return (
    <section className="timeline-card active-feed-card panel-stack" data-testid="active-feed-card" aria-label="Feeding now">
      <div className="active-feed-header">
        <div>
          <p className="paper-heading">Now</p>
          <h2>Feeding now</h2>
        </div>
        <p className="status-chip" data-testid="feed-session-status">
          {status}
        </p>
      </div>
      <div className="active-feed-current-segment" data-testid="active-feed-current-segment">
        <span>{formatSegmentLabel(currentSegment)}</span>
        <strong data-testid="active-feed-segment-elapsed">{formatElapsed(currentSegmentStartedAt, now)}</strong>
      </div>
      <p className="active-feed-guidance" data-testid="active-feed-guidance">{nextActionGuidance(currentSegment)}</p>
      {orderedSegments.length > 0 ? (
        <ol className="active-feed-segments" data-testid="active-feed-segment-sequence" aria-label="Feed segment sequence">
          {orderedSegments.map((segment, index) => (
            <li key={segment.id}>
              <span>{formatSegmentLabel(segment)}</span>
              <strong>{segmentDuration(segment, orderedSegments[index + 1], session, now)}</strong>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="active-feed-actions" role="group" aria-label="Feed controls">
        {segmentActions.map((action) => (
          <button key={action.kind} type="button" onClick={() => onAddSegment(session.id, action.kind)}>
            {action.label}
          </button>
        ))}
      </div>
      <div className="active-feed-secondary-actions">
        <button
          type="button"
          onClick={() => {
            setDurationDraft(String(getDraftDurationMinutes(session, now)));
            setDurationEditorOpen(true);
          }}
        >
          Edit time
        </button>
        <button type="button" className="action-primary" onClick={() => onCloseSession(session.id)}>
          Close feed
        </button>
      </div>
      {durationEditorOpen ? (
        <div className="timeline-card panel-stack" data-testid="feed-duration-editor">
          <label htmlFor={`active-feed-duration-${session.id}`} className="paper-heading">
            Feed duration (minutes)
          </label>
          <input
            id={`active-feed-duration-${session.id}`}
            data-testid="feed-duration-input"
            type="number"
            min={1}
            step={1}
            value={durationDraft}
            onChange={(event) => setDurationDraft(event.target.value)}
          />
          <div className="active-feed-secondary-actions">
            <button
              type="button"
              className="action-primary"
              onClick={() => {
                onImportDuration(session.id, Number(durationDraft));
                setDurationEditorOpen(false);
              }}
            >
              Save duration
            </button>
            <button type="button" onClick={() => setDurationEditorOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
