import type { PaperJournalRowViewModel } from './paper-journal.types';

type Props = {
  row: PaperJournalRowViewModel;
};

const labels = [
  ['Wake', 'wakeUpTime'],
  ['Feed', 'startOfFeedTime'],
  ['Play', 'startOfPlayTime'],
  ['Sleep', 'startOfSleepTime'],
  ['Urine', 'urine'],
  ['Stool', 'stool'],
  ['Remarks', 'remarks']
] as const;

export function JournalRowSummary({ row }: Props) {
  return (
    <section className="journal-summary" data-testid="journal-summary">
      <div className="journal-summary-grid">
        {labels.map(([label, key]) => {
          const value = row[key];
          return (
            <article className="journal-summary-cell" key={label}>
              <p className="paper-heading">{label}</p>
              <p className="journal-summary-value" data-testid={`journal-summary-${key}`}>
                {value.display}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
