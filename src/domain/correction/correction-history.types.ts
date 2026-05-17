export type CorrectionHistoryAction =
  | 'correction.create'
  | 'correction.update'
  | 'correction.delete'
  | 'correction.soft_delete'
  | 'correction.restore'
  | 'correction.undo'
  | 'correction.merge';

export type CorrectionHistoryDTO = {
  id: string;
  action: CorrectionHistoryAction;
  sourceId: string;
  sourceType: 'cycle-event' | 'feed-session' | 'feed-segment';
  createdAt: string;
  summary: string;
  reason?: 'wrong_time' | 'accidental_tap' | 'duplicate' | 'late_entry' | 'paper_journal' | 'facilitator_advice' | 'other';
};
