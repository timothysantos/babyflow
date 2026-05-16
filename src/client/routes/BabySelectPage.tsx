import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [language, setLanguage] = useState<PreferredLanguage>(() => {
    const stored = window.localStorage.getItem('babyflow.locale');
    if (stored === 'en' || stored === 'zh-Hans' || stored === 'bilingual') {
      return stored;
    }
    return 'en';
  });
  const [selectedBaby, setSelectedBaby] = useState<BabyDraft | null>(null);

  useEffect(() => {
    window.localStorage.setItem('babyflow.locale', language);
  }, [language]);

  return (
    <main className="panel-stack" data-testid="baby-select-page">
      <section className="timeline-card">
        <p className="section-label">Profile and language</p>
        <h1 className="today-title">Baby profile / 宝宝资料</h1>
        <Link to="/">Today / 今天</Link>
      </section>
      <section className="timeline-card panel-stack">
        <LanguageToggle value={language} onChange={setLanguage} />
        <section aria-label="labels-preview" className="replay-card">
        <p>{labelsFor(language)['journal.wake_up_time']}</p>
        <p>{labelsFor(language)['journal.feed']}</p>
        </section>
      </section>
      <section className="timeline-card panel-stack">
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
      </section>
      {selectedBaby ? (
        <section className="timeline-card">
          <p data-testid="selected-baby">Selected: {selectedBaby.name}</p>
          <p data-testid="age-week">
            Age week: {calculateAgeWeek(selectedBaby.birthDate, '2026-05-16')}
          </p>
        </section>
      ) : (
        <p className="timeline-card" data-testid="age-week">
          Age week: 0
        </p>
      )}
      <p className="status-chip live-chip" data-testid="bilingual-label">
        {labelsFor(language)['journal.wake_up_time']}
      </p>
    </main>
  );
}
