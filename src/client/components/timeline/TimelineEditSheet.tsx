type Props = {
  title: string;
  label: string;
  currentValue: string;
  suggestedReason?: string | null;
  selectedReason?: string;
  onUseSuggestedReason?: () => void;
  onSave: (nextValue: string) => void;
  onReasonChange?: (reason: string) => void;
  onClose: () => void;
};

const correctionReasons = [
  { value: 'wrong_time', label: 'Wrong time' },
  { value: 'accidental_tap', label: 'Accidental tap' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'late_entry', label: 'Late entry' },
  { value: 'paper_journal', label: 'Corrected from paper journal' },
  { value: 'facilitator_advice', label: 'Facilitator advice' },
  { value: 'other', label: 'Other' }
] as const;

export function TimelineEditSheet({
  title,
  label,
  currentValue,
  suggestedReason,
  selectedReason,
  onUseSuggestedReason,
  onSave,
  onReasonChange,
  onClose
}: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Timeline edit" data-testid="timeline-edit-sheet">
      <div className="page-row-header">
        <div>
          <p className="paper-heading">Timeline edit</p>
          <h2 className="today-title">{title}</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="ui-quiet">{label}</p>
      <input aria-label={`${title} value`} defaultValue={currentValue} data-testid="timeline-edit-input" />
      <label className="panel-stack">
        <span className="paper-heading">Correction reason</span>
        <select
          aria-label={`${title} correction reason`}
          data-testid="timeline-edit-reason"
          value={selectedReason ?? ''}
          onChange={(event) => onReasonChange?.(event.target.value)}
        >
          <option value="">Choose a reason</option>
          {correctionReasons.map((reason) => (
            <option key={reason.value} value={reason.value}>
              {reason.label}
            </option>
          ))}
        </select>
      </label>
      {suggestedReason ? (
        <div className="status-chip" data-testid="timeline-edit-suggestion">
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
            const input = document.querySelector<HTMLInputElement>('[data-testid="timeline-edit-input"]');
            onSave(input?.value ?? currentValue);
          }}
        >
          Save update
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </section>
  );
}
