import type { InterventionAttemptDTO, InterventionAttemptKind, InterventionAttemptOutcome } from '../../../domain/intervention/intervention.types';
import { formatSingaporeDateTime } from '../../lib/singapore-time';

type Props = {
  attempts: InterventionAttemptDTO[];
  onRecordAttempt: (kind: InterventionAttemptKind, outcome?: InterventionAttemptOutcome) => void;
};

const kinds: Array<{ kind: InterventionAttemptKind; label: string }> = [
  { kind: 'SOOTHE', label: 'Soothe' },
  { kind: 'WAIT', label: 'Wait' },
  { kind: 'SING', label: 'Sing' },
  { kind: 'PAT', label: 'Pat' },
  { kind: 'BURP', label: 'Burp' },
  { kind: 'WAKE_ATTEMPT', label: 'Wake attempt' }
];

export function InterventionAttemptsPanel({ attempts, onRecordAttempt }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Tried" data-testid="intervention-attempts-panel">
      <p className="paper-heading">Tried</p>
      <div className="panel-stack" role="group" aria-label="Record what you tried">
        {kinds.map((entry) => (
          <button key={entry.kind} type="button" onClick={() => onRecordAttempt(entry.kind)}>
            {entry.label}
          </button>
        ))}
      </div>
      {attempts.length > 0 ? (
        <ol className="timeline-list" data-testid="intervention-attempt-list">
          {attempts.map((attempt) => (
            <li key={attempt.id} className="timeline-item" data-testid="intervention-attempt-item">
              <span className="paper-heading">{attempt.kind}</span>
              <span className="timeline-item-label">
                {attempt.label}
                {attempt.outcome !== 'UNKNOWN' ? ` · ${attempt.outcome.toLowerCase()}` : ''}
              </span>
              <span className="timeline-item-meta">{formatSingaporeDateTime(attempt.recordedAt)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="intervention-attempt-empty">
          No caregiver attempts yet.
        </p>
      )}
    </section>
  );
}
