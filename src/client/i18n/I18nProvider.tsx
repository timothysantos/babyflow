import type { PropsWithChildren } from 'react';

type Language = 'en' | 'zh' | 'bilingual';

export type I18nState = {
  language: Language;
};

export function I18nProvider({ children }: PropsWithChildren) {
  return children;
}
