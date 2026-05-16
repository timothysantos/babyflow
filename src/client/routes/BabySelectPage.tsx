import { useState } from 'react';
import { BabyForm } from '../components/baby/BabyForm';
import { LanguageToggle } from '../components/i18n/LanguageToggle';
import { calculateAgeWeek, type BabyDraft, type PreferredLanguage } from '../../domain/baby/baby.types';
import en from '../../infrastructure/i18n/locales/en.json';
import zh from '../../infrastructure/i18n/locales/zh-Hans.json';
import bilingual from '../../infrastructure/i18n/locales/bilingual.json';

function labelsFor(language: PreferredLanguage) {
  if (language === 'zh-Hans') return zh;
  if (language === 'bilingual') return bilingual;
  return en;
}

export function BabySelectPage() {
  const [language, setLanguage] = useState<PreferredLanguage>('en');
  const [selectedBaby, setSelectedBaby] = useState<BabyDraft | null>(null);

  return (
    <main>
      <h1>Baby profile / 宝宝资料</h1>
      <LanguageToggle value={language} onChange={setLanguage} />
      <section aria-label="labels-preview">
        <p>{labelsFor(language)['journal.wake_up_time']}</p>
        <p>{labelsFor(language)['journal.feed']}</p>
      </section>
      <BabyForm
        preferredLanguage={language}
        onCreate={async (draft: BabyDraft) => {
          const nextBaby = { ...draft, preferredLanguage: language };
          setSelectedBaby(nextBaby);
        }}
      />
      <button
        onClick={async () => {
          if (selectedBaby) setSelectedBaby(selectedBaby);
        }}
      >
        Select first baby
      </button>
      {selectedBaby ? (
        <>
          <p data-testid="selected-baby">Selected: {selectedBaby.name}</p>
          <p data-testid="age-week">
            Age week: {calculateAgeWeek(selectedBaby.birthDate, '2026-05-16')}
          </p>
        </>
      ) : (
        <p data-testid="age-week">Age week: 0</p>
      )}
      <p data-testid="bilingual-label">{labelsFor(language)['journal.wake_up_time']}</p>
    </main>
  );
}
