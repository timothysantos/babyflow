export type InterventionAttemptKind = 'BURP' | 'WAKE_ATTEMPT' | 'WAIT' | 'SING' | 'PAT' | 'SOOTHE';

export type InterventionAttemptOutcome = 'SUCCESS' | 'FAILED' | 'UNKNOWN';

export type InterventionAttemptDraft = {
  babyId: string;
  kind: InterventionAttemptKind;
  label: string;
  outcome?: InterventionAttemptOutcome;
  context?: string;
};

export type InterventionAttemptDTO = {
  id: string;
  babyId: string;
  kind: InterventionAttemptKind;
  label: string;
  outcome: InterventionAttemptOutcome;
  context: string;
  recordedAt: string;
};
