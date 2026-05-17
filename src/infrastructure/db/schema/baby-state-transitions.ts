export type BabyStateTransitionRow = {
  id: string;
  babyId: string;
  fromState: string;
  toState: string;
  confidence: string;
  sourceType: string;
  sourceId: string;
  triggerLabel: string;
  triggerKind: string;
  note: string | null;
  recordedAt: string;
};
