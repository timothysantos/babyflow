import type { BabyStateTransitionDTO } from '../../domain/baby-state/baby-state.types';

export function mapBabyStateTransition(transition: BabyStateTransitionDTO) {
  return {
    id: transition.id,
    fromState: transition.fromState,
    toState: transition.toState,
    confidence: transition.confidence,
    label: `${transition.fromState} → ${transition.toState}`,
    triggerLabel: transition.triggerLabel,
    triggerKind: transition.triggerKind,
    recordedAt: transition.recordedAt,
    note: transition.note ?? ''
  };
}
