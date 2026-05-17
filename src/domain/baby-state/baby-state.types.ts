export type BabyState = 'UNKNOWN' | 'AWAKE_CALM' | 'CRYING' | 'FEEDING' | 'DROWSY' | 'ASLEEP' | 'SETTLING' | 'SELF_ENTERTAINING';

export type BabyStateTransitionConfidence = 'CONFIRMED' | 'LIKELY' | 'UNSURE';

export type BabyStateTransitionSourceType = 'cycle-event' | 'feed-session' | 'feed-segment' | 'intervention';

export type BabyStateTransitionDTO = {
  id: string;
  babyId: string;
  fromState: BabyState;
  toState: BabyState;
  confidence: BabyStateTransitionConfidence;
  recordedAt: string;
  sourceType: BabyStateTransitionSourceType;
  sourceId: string;
  triggerLabel: string;
  triggerKind: string;
  note?: string;
};

export type BabyStateTransitionDraft = {
  babyId: string;
  fromState: BabyState;
  toState: BabyState;
  confidence: BabyStateTransitionConfidence;
  recordedAt: string;
  sourceType: BabyStateTransitionSourceType;
  sourceId: string;
  triggerLabel: string;
  triggerKind: string;
  note?: string;
};
