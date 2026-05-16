export type CycleEventKind = 'WAKE' | 'FEED' | 'PLAY' | 'BURP' | 'DIAPER' | 'PUT_DOWN' | 'ASLEEP' | 'NOTE' | 'MORE';

export type CycleEventDraft = {
  kind: CycleEventKind;
  label: string;
  babyId?: string;
};

export type CycleEventDTO = {
  id: string;
  kind: CycleEventKind;
  label: string;
  babyId?: string;
  recordedAt: string;
};

export type EventKind = CycleEventKind;
export type EventDraft = CycleEventDraft;
export type EventDTO = CycleEventDTO;
