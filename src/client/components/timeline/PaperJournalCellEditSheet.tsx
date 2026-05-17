import type { JournalCellValue } from '../journal/paper-journal.types';

type Props = {
  title: string;
  currentValue: string;
  currentSource: JournalCellValue['source'];
  onSave: (nextValue: string) => void;
  onReasonChange?: (reason: string) => void;
  suggestedReason?: string | null;
  selectedReason?: string;
  onUseSuggestedReason?: () => void;
  onDelete: () => void;
  onMergeDuplicate: () => void;
  onRestore: () => void;
  onClose: () => void;
};

export function PaperJournalCellEditSheet({
  title,
  currentValue,
  currentSource,
  onSave,
  onReasonChange,
  suggestedReason,
  selectedReason,
  onUseSuggestedReason,
  onDelete,
  onMergeDuplicate,
  onRestore,
  onClose
}: Props) {
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
      <label className="panel-stack">
        <span className="paper-heading">Correction reason</span>
        <select aria-label={`${title} correction reason`} data-testid="paper-journal-cell-reason" value={selectedReason ?? ''} onChange={(event) => onReasonChange?.(event.target.value)}>
          <option value="">Choose a reason</option>
          <option value="wrong_time">Wrong time</option>
          <option value="accidental_tap">Accidental tap</option>
          <option value="duplicate">Duplicate</option>
          <option value="late_entry">Late entry</option>
          <option value="paper_journal">Corrected from paper journal</option>
          <option value="facilitator_advice">Facilitator advice</option>
          <option value="other">Other</option>
        </select>
      </label>
      {suggestedReason ? (
        <div className="status-chip" data-testid="paper-journal-cell-suggestion">
          <span>Suggested correction reason: {suggestedReason}</span>
          {onUseSuggestedReason ? (
            <button type="button" onClick={onUseSuggestedReason}>
              Use suggested reason
            </button>
          ) : null}
        </div>
      ) : null}
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
        <button type="button" onClick={onDelete}>
          Delete cell
        </button>
        <button type="button" onClick={onMergeDuplicate}>
          Merge duplicate
        </button>
        <button type="button" onClick={onRestore}>
          Restore
        </button>
      </div>
    </section>
  );
}
