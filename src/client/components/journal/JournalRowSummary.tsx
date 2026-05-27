import type { PaperJournalRowViewModel } from './paper-journal.types';

type Props = {
  row: PaperJournalRowViewModel;
  onEditCell?: (key: keyof PaperJournalRowViewModel, label: string, value: string) => void;
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

export function JournalRowSummary({ row, onEditCell }: Props) {
  return (
    <section className="journal-summary" data-testid="journal-summary">
      <ul className="journal-summary-list">
        {labels.map(([label, key]) => {
          const value = row[key];
          return (
            <li className="journal-summary-cell" key={label}>
              <p className="paper-heading">{label}</p>
              <button
                type="button"
                className="journal-summary-value journal-summary-value-button"
                data-testid={`journal-summary-${key}`}
                onClick={() => onEditCell?.(key, label, value.display)}
              >
                {value.display}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
