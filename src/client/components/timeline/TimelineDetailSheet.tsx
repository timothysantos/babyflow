import type { TimelineItemDTO } from './timeline.types';
import { formatSingaporeDateTime } from '../../lib/singapore-time';

type Props = {
  item: TimelineItemDTO;
  onUndo: () => void;
  onDelete: () => void;
  onEditTime: () => void;
  onEditDetails: () => void;
  onMergeDuplicate: () => void;
  onClose: () => void;
};

export function TimelineDetailSheet({ item, onUndo, onDelete, onEditTime, onEditDetails, onMergeDuplicate, onClose }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Timeline item details" data-testid="timeline-detail-sheet">
      <div className="page-row-header">
        <div>
          <p className="paper-heading">Timeline item</p>
          <h2 className="today-title">{item.title}</h2>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="ui-quiet">{item.details}</p>
      <p className="timeline-item-meta">{formatSingaporeDateTime(item.recordedAt)}</p>
      <div className="panel-stack">
        <button type="button" onClick={onEditTime}>
          Update time
        </button>
        <button type="button" onClick={onEditDetails}>
          Update details
        </button>
        <button type="button" onClick={onMergeDuplicate}>
          Merge duplicate
        </button>
        <button type="button" onClick={onDelete}>
          Soft delete
        </button>
        <button type="button" onClick={onUndo}>
          Undo last action
        </button>
      </div>
    </section>
  );
}
