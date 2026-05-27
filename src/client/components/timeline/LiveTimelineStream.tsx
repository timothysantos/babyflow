import type { TimelineItemDTO } from './timeline.types';
import { formatSingaporeDateTime } from '../../lib/singapore-time';

type Props = {
  items: TimelineItemDTO[];
  onSelect: (item: TimelineItemDTO) => void;
  title?: string;
  emptyCopy?: string;
};

export function LiveTimelineStream({ items, onSelect, title = 'Today log', emptyCopy = 'No entries yet. Use a quick button when something happens.' }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label={title} data-testid="today-log-preview">
      <p className="paper-heading">{title}</p>
      {items.length > 0 ? (
          <ol className="timeline-list" data-testid="live-timeline-items">
            {items.map((item) => (
              <li key={item.id} className="timeline-item">
                <button
                  type="button"
                  className="timeline-item-button"
                  onClick={() => onSelect(item)}
                  aria-label={`${item.title} ${item.details}`}
                >
                  <span className="timeline-item-dot" aria-hidden="true" />
                  <span className="timeline-item-content">
                    <span className="paper-heading">{item.title}</span>
                    <span className="timeline-item-label">{item.details}</span>
                    <span className="timeline-item-meta">{formatSingaporeDateTime(item.recordedAt)}</span>
                  </span>
                </button>
              </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="live-timeline-empty">
          {emptyCopy}
        </p>
      )}
    </section>
  );
}
