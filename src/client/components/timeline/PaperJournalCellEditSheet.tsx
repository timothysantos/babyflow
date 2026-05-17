import type { JournalCellValue } from '../journal/paper-journal.types';

type Props = {
  title: string;
  currentValue: string;
  currentSource: JournalCellValue['source'];
  onSave: (nextValue: string) => void;
  onRestore: () => void;
  onClose: () => void;
};

export function PaperJournalCellEditSheet({ title, currentValue, currentSource, onSave, onRestore, onClose }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Paper journal cell edit" data-testid="paper-journal-cell-edit-sheet">
      <div className="page-row-header">
        <div>
          <p className="paper-heading">Paper journal cell</p>
          <h2 className="today-title">{title}</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="ui-quiet">Source: {currentSource}</p>
      <input aria-label={`${title} value`} defaultValue={currentValue} data-testid="paper-journal-cell-edit-input" />
      <div className="panel-stack">
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>('[data-testid="paper-journal-cell-edit-input"]');
            onSave(input?.value ?? currentValue);
          }}
        >
          Save update
        </button>
        <button type="button" onClick={onRestore}>
          Restore
        </button>
      </div>
    </section>
  );
}

