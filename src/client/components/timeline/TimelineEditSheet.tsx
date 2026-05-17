type Props = {
  title: string;
  label: string;
  currentValue: string;
  onSave: (nextValue: string) => void;
  onClose: () => void;
};

export function TimelineEditSheet({ title, label, currentValue, onSave, onClose }: Props) {
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
