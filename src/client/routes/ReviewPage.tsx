import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../layouts/PageShell';
import type { CycleEventDTO } from '../../domain/event/event.types';
import type { FeedSessionDTO } from '../../domain/feed/feed.types';
import type { InterventionAttemptDTO } from '../../domain/intervention/intervention.types';
import type { BabyStateTransitionDTO } from '../../domain/baby-state/baby-state.types';
import { buildBabyStateTransitions } from '../../domain/baby-state/state-transition-engine';
import { buildTimelineClusters } from '../../domain/timeline-clustering/cluster-engine';
import { ClusterReviewPanel } from '../components/review/ClusterReviewPanel';
import { NeedsReviewBanner } from '../components/review/NeedsReviewBanner';

type ReviewRange = '24h' | '3d' | '7d' | 'all';

function url(path: string) {
  return new URL(path, window.location.origin);
}

function parseJsonResponse<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${label} request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function getStartForRange(range: ReviewRange, now: number) {
  if (range === 'all') return 0;
  const hours = range === '24h' ? 24 : range === '3d' ? 72 : 168;
  return now - hours * 60 * 60 * 1000;
}

export function ReviewPage() {
  const [range, setRange] = useState<ReviewRange>('24h');
  const [events, setEvents] = useState<CycleEventDTO[]>([]);
  const [feedSessions, setFeedSessions] = useState<FeedSessionDTO[]>([]);
  const [interventions, setInterventions] = useState<InterventionAttemptDTO[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetch(url('/cycle-events'))
      .then((response) => parseJsonResponse<{ events?: CycleEventDTO[] }>(response, 'cycle-events'))
      .then((payload) => setEvents(payload.events ?? []))
      .catch(() => setEvents([]));

    void fetch(url('/feed-sessions'))
      .then((response) => parseJsonResponse<{ sessions?: FeedSessionDTO[] }>(response, 'feed-sessions'))
      .then((payload) => setFeedSessions(payload.sessions ?? []))
      .catch(() => setFeedSessions([]));

    void fetch(url('/interventions'))
      .then((response) => parseJsonResponse<{ interventions?: InterventionAttemptDTO[] }>(response, 'interventions'))
      .then((payload) => setInterventions(payload.interventions ?? []))
      .catch(() => setInterventions([]));
  }, []);

  const visibleEvents = useMemo(() => {
    const start = getStartForRange(range, now);
    return range === 'all' ? events : events.filter((event) => new Date(event.recordedAt).getTime() >= start);
  }, [events, now, range]);
  const visibleFeeds = useMemo(() => {
    const start = getStartForRange(range, now);
    return range === 'all' ? feedSessions : feedSessions.filter((session) => new Date(session.startedAt).getTime() >= start);
  }, [feedSessions, now, range]);
  const visibleInterventions = useMemo(() => {
    const start = getStartForRange(range, now);
    return range === 'all' ? interventions : interventions.filter((attempt) => new Date(attempt.recordedAt).getTime() >= start);
  }, [interventions, now, range]);

  const transitions: BabyStateTransitionDTO[] = useMemo(
    () => buildBabyStateTransitions(visibleEvents, visibleFeeds, visibleInterventions),
    [visibleEvents, visibleFeeds, visibleInterventions]
  );
  const clusters = useMemo(
    () => buildTimelineClusters(visibleEvents, visibleFeeds, visibleInterventions, transitions),
    [visibleEvents, visibleFeeds, visibleInterventions, transitions]
  );
  const needsChecking = clusters.filter((cluster) => cluster.needsReview).length;

  return (
    <PageShell
      eyebrow="Review"
      title="Review / 复盘"
      subtitle="Use this page when you want to inspect patterns, ranges, and items that need checking."
      testId="review-page"
      className="review-page"
      actions={
        <>
          <div className="page-hero-actions-row">
            <Link to="/">Today / 今天</Link>
            <Link to="/profile">Profile / 资料</Link>
            <Link to="/guide">Guide / 说明</Link>
          </div>
          <div className="help-anchor-nav" aria-label="Review ranges">
            {(['24h', '3d', '7d', 'all'] as const).map((entry) => (
              <button key={entry} type="button" aria-pressed={range === entry} onClick={() => setRange(entry)}>
                {entry === '24h' ? '24h' : entry === '3d' ? '3 days' : entry === '7d' ? '7 days' : 'All'}
              </button>
            ))}
          </div>
        </>
      }
      >
      <section className="timeline-card panel-stack">
        <p className="paper-heading">What this page is for</p>
        <p className="ui-quiet">
          Review is where you inspect the last 24 hours, 3 days, 7 days, or everything you have logged so far without
          crowding the Today screen.
        </p>
      </section>

      <section className="timeline-card panel-stack">
        <p className="paper-heading">Cycles</p>
        <p className="ui-quiet">{visibleEvents.length > 0 ? `${visibleEvents.length} events in range` : 'No events in this range yet.'}</p>
      </section>

      <section className="timeline-card panel-stack">
        <p className="paper-heading">Feeds</p>
        <p className="ui-quiet">{visibleFeeds.length > 0 ? `${visibleFeeds.length} feeds in range` : 'No feed sessions in this range yet.'}</p>
      </section>

      <section className="timeline-card panel-stack">
        <p className="paper-heading">Sleep</p>
        <p className="ui-quiet">{transitions.filter((transition) => transition.toState === 'ASLEEP').length} sleep transitions in range.</p>
      </section>

      <section className="timeline-card panel-stack">
        <p className="paper-heading">What you tried</p>
        <p className="ui-quiet">{visibleInterventions.length > 0 ? `${visibleInterventions.length} intervention attempts in range` : 'No intervention attempts in this range yet.'}</p>
      </section>

      <section className="timeline-card panel-stack">
        <p className="paper-heading">Why this might be happening</p>
        <p className="ui-quiet">{transitions.length > 0 ? `${transitions.length} state transitions in range` : 'No baby state transitions in this range yet.'}</p>
      </section>

      <section className="timeline-card panel-stack">
        <p className="paper-heading">Notes / remarks</p>
        <p className="ui-quiet">{visibleEvents.filter((event) => event.kind === 'NOTE').length} notes in range.</p>
      </section>

      <NeedsReviewBanner count={needsChecking} />
      <ClusterReviewPanel
        clusters={clusters}
        onMarkReviewed={() => {
          /* review action is scaffolded here for the coach/reviewer flow */
        }}
      />
    </PageShell>
  );
}
