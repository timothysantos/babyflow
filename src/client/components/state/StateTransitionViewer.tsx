import type { BabyStateTransitionDTO } from '../../../domain/baby-state/baby-state.types';
import { mapBabyStateTransition } from '../../../infrastructure/mappers/baby-state-mapper';

type Props = {
  transitions: BabyStateTransitionDTO[];
};

export function StateTransitionViewer({ transitions }: Props) {
  const mapped = transitions.map(mapBabyStateTransition);

  return (
    <section className="timeline-card panel-stack" aria-label="State transitions" data-testid="state-transition-viewer">
      <p className="paper-heading">State transitions</p>
      {mapped.length > 0 ? (
        <ol className="timeline-list" data-testid="state-transition-list">
          {mapped.map((transition) => (
            <li key={transition.id} className="timeline-item" data-testid="state-transition-item">
              <span className="paper-heading">{transition.label}</span>
              <span className="timeline-item-label">
                {transition.confidence} · {transition.triggerLabel}
              </span>
              <span className="timeline-item-meta">{transition.note || transition.recordedAt}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="state-transition-empty">
          No state transitions yet.
        </p>
      )}
    </section>
  );
}
