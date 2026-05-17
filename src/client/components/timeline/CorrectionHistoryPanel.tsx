import type { CorrectionHistoryDTO } from '../../../domain/correction/correction-history.types';

type Props = {
  items: CorrectionHistoryDTO[];
};

export function CorrectionHistoryPanel({ items }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Correction history" data-testid="correction-history-panel">
      <p className="paper-heading">Correction history</p>
      {items.length > 0 ? (
        <ol className="history-list" data-testid="correction-history-items">
          {items.map((item) => (
            <li key={item.id} className="history-item">
              <span className="paper-heading">{item.action}</span>
              <span className="timeline-item-label">{item.summary}</span>
              <span className="timeline-item-meta">{item.createdAt}</span>
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

