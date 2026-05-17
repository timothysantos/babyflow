import type { TimelineItemDTO } from './timeline.types';

type Props = {
  items: TimelineItemDTO[];
  onSelect: (item: TimelineItemDTO) => void;
};

export function LiveTimelineStream({ items, onSelect }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Live timeline stream" data-testid="live-timeline-stream">
      <p className="paper-heading">Live timeline stream</p>
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
                <span className="paper-heading">{item.title}</span>
                <span className="timeline-item-label">{item.details}</span>
                <span className="timeline-item-meta">{item.recordedAt}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="live-timeline-empty">
          No timeline items yet. Add a quick action to start the stream.
        </p>
      )}
    </section>
  );
}
