export type BabyRow = {
  id: string;
  name: string;
  birthDate: string;
  birthWeightKg: number | null;
  feedingMode: 'BREAST' | 'EBM' | 'FORMULA' | 'MIXED';
  timezone: string;
  preferredLanguage: 'en' | 'zh-Hans' | 'bilingual';
  createdAt: string;
  updatedAt: string;
  selectedAt: string | null;
};
