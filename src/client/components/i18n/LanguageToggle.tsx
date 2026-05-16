import type { PreferredLanguage } from '../../../domain/baby/baby.types';

type Props = {
  value: PreferredLanguage;
  onChange: (value: PreferredLanguage) => void;
};

export function LanguageToggle({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Language / 语言" className="panel-stack">
      {(['en', 'zh-Hans', 'bilingual'] as const).map((language) => (
        <button
          key={language}
          type="button"
          aria-pressed={value === language}
          onClick={() => onChange(language)}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
