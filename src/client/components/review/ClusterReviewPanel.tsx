import type { TimelineClusterDTO } from '../../../domain/timeline-clustering/timeline-cluster.types';
import { formatSingaporeDateTime } from '../../lib/singapore-time';

type Props = {
  clusters: TimelineClusterDTO[];
  onMarkReviewed: (clusterId: string) => void;
};

export function ClusterReviewPanel({ clusters, onMarkReviewed }: Props) {
  return (
    <section className="timeline-card panel-stack" data-testid="cluster-review-panel" aria-label="Needs checking">
      <p className="paper-heading">Needs checking</p>
      {clusters.length > 0 ? (
        <ol className="timeline-list" data-testid="cluster-review-list">
          {clusters.map((cluster) => (
            <li key={cluster.id} className="timeline-item" data-testid="cluster-review-item">
              <button type="button" className="timeline-item-button" onClick={() => onMarkReviewed(cluster.id)}>
                <span className="paper-heading">{cluster.clusterType}</span>
                <span className="timeline-item-label">
                  {cluster.needsReview ? 'Needs checking' : cluster.status} · {cluster.reason ?? 'grouped cycle'}
                </span>
                <span className="timeline-item-meta">
                {formatSingaporeDateTime(cluster.startedAt)} → {formatSingaporeDateTime(cluster.endedAt ?? cluster.startedAt)}
              </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="cluster-review-empty">
          No cycles need checking yet.
        </p>
      )}
    </section>
  );
}
