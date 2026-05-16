export type EventKind = 'WAKE' | 'FEED' | 'BURP' | 'DIAPER' | 'PUT_DOWN' | 'ASLEEP' | 'NOTE' | 'MORE';

export type EventDraft = {
  kind: EventKind;
  label: string;
};

export type EventDTO = {
  id: string;
  kind: EventKind;
  label: string;
  recordedAt: string;
};
