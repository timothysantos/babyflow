export type ObservationConfidence = 'CONFIRMED' | 'LIKELY' | 'UNSURE';

export type JournalCellSource = 'MANUAL' | 'EVENT' | 'DERIVED' | 'INFERRED' | 'NOT_APPLICABLE' | 'MISSING';

export type JournalCellValue = {
  display: string;
  source: JournalCellSource;
  confidence: ObservationConfidence;
  needsReview: boolean;
};

export type PaperJournalRowViewModel = {
  cycleId: string;
  rowStatus: 'ACTIVE' | 'COMPLETE' | 'NEEDS_REVIEW';

  wakeUpTime: JournalCellValue;
  startOfFeedTime: JournalCellValue;
  feedSummary: JournalCellValue;
  startOfPlayTime: JournalCellValue;
  startOfSleepTime: JournalCellValue;
  sleepDuration: JournalCellValue;
  urine: JournalCellValue;
  stool: JournalCellValue;
  remarks: JournalCellValue;

  details: {
    timelineEventIds: string[];
    feedSessionIds: string[];
    interventionAttemptIds: string[];
    diaperEventIds: string[];
    stateTransitionIds: string[];
  };
};
