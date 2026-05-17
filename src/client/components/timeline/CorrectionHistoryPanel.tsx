import type { CorrectionHistoryDTO } from '../../../domain/correction/correction-history.types';

type Props = {
  items: CorrectionHistoryDTO[];
  onRestoreItem?: (item: CorrectionHistoryDTO) => void;
};

export function CorrectionHistoryPanel({ items, onRestoreItem }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Correction history" data-testid="correction-history-panel">
      <p className="paper-heading">Correction history</p>
      {items.length > 0 ? (
        <ol className="history-list" data-testid="correction-history-items">
          {items.map((item) => (
            <li key={item.id} className="history-item">
              <div className="history-item-body">
                <span className="paper-heading">{item.action}</span>
                <span className="timeline-item-label">{item.summary}</span>
                {item.reason ? <span className="timeline-item-label">Reason: {item.reason}</span> : null}
                <span className="timeline-item-meta">{item.createdAt}</span>
              </div>
              {onRestoreItem ? (
                <button type="button" onClick={() => onRestoreItem(item)}>
                  Restore
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="correction-history-empty">
          Timeline corrections will appear here.
        </p>
      )}
    </section>
  );
}
