import type { JournalCellValue } from '../journal/paper-journal.types';

type Props = {
  title: string;
  currentValue: string;
  currentSource: JournalCellValue['source'];
  onSave: (nextValue: string) => void;
  onDelete: () => void;
  onMergeDuplicate: () => void;
  onRestore: () => void;
  onClose: () => void;
};

export function CompactBlockDetailSheet({
  title,
  currentValue,
  currentSource,
  onSave,
  onDelete,
  onMergeDuplicate,
  onRestore,
  onClose
}: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Compact block detail" data-testid="compact-block-detail-sheet">
      <div className="page-row-header">
        <div>
          <p className="paper-heading">Compact block</p>
          <h2 className="today-title">{title}</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="ui-quiet">Source: {currentSource}</p>
      <input aria-label={`${title} value`} defaultValue={currentValue} data-testid="compact-block-edit-input" />
      <div className="panel-stack">
        <button
          type="button"
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>('[data-testid="compact-block-edit-input"]');
            onSave(input?.value ?? currentValue);
          }}
        >
          Save update
        </button>
        <button type="button" onClick={onDelete}>
          Delete block
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
