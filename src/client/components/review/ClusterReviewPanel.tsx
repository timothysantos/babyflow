import type { TimelineClusterDTO } from '../../../domain/timeline-clustering/timeline-cluster.types';

type Props = {
  clusters: TimelineClusterDTO[];
  onMarkReviewed: (clusterId: string) => void;
};

export function ClusterReviewPanel({ clusters, onMarkReviewed }: Props) {
  return (
    <section className="timeline-card panel-stack" data-testid="cluster-review-panel" aria-label="Cluster review">
      <p className="paper-heading">Timeline clusters</p>
      {clusters.length > 0 ? (
        <ol className="timeline-list" data-testid="cluster-review-list">
          {clusters.map((cluster) => (
            <li key={cluster.id} className="timeline-item" data-testid="cluster-review-item">
              <button type="button" className="timeline-item-button" onClick={() => onMarkReviewed(cluster.id)}>
                <span className="paper-heading">{cluster.clusterType}</span>
                <span className="timeline-item-label">
                  {cluster.needsReview ? 'NEEDS_REVIEW' : cluster.status} · {cluster.reason ?? 'clustered episode'}
                </span>
                <span className="timeline-item-meta">
                  {cluster.startedAt} → {cluster.endedAt ?? cluster.startedAt}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ui-quiet" data-testid="cluster-review-empty">
          No clusters yet.
        </p>
      )}
    </section>
  );
}
