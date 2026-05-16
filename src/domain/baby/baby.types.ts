export type PreferredLanguage = 'en' | 'zh-Hans' | 'bilingual';

export type FeedingMode = 'BREAST' | 'EBM' | 'FORMULA' | 'MIXED';

export type BabyDTO = {
  id: string;
  name: string;
  birthDate: string;
  birthWeightKg?: number;
  feedingMode: FeedingMode;
  timezone: string;
  preferredLanguage: PreferredLanguage;
  createdAt: string;
  updatedAt: string;
};

export type BabyDraft = {
  name: string;
  birthDate: string;
  timezone: string;
  preferredLanguage?: PreferredLanguage;
  birthWeightKg?: number;
  feedingMode?: FeedingMode;
};

export function validateBabyDraft(draft: BabyDraft): BabyDraft {
  if (!draft.name.trim()) throw new Error('Baby name is required');
  if (!draft.birthDate.trim()) throw new Error('birthDate is required');
  if (!draft.timezone.trim()) throw new Error('timezone is required');

  return {
    ...draft,
    preferredLanguage: draft.preferredLanguage ?? 'en',
    feedingMode: draft.feedingMode ?? 'BREAST'
  };
}

export function calculateAgeWeek(birthDate: string, onDate: string): number {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const now = new Date(`${onDate}T00:00:00Z`);
  const diffDays = Math.floor((now.getTime() - birth.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, Math.floor(diffDays / 7));
}
