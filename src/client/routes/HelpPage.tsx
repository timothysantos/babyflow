import { Link } from 'react-router-dom';
import { PageShell } from '../layouts/PageShell';
import { GuideSection } from '../components/help/GuideSection';

const guideSteps = [
  { href: '#top', label: 'Top' },
  { href: '#details', label: 'Details' },
  { href: '#corrections', label: 'Corrections' },
  { href: '#journal', label: 'Journal' },
  { href: '#review', label: 'Review' }
];

export function HelpPage() {
  return (
    <PageShell
      eyebrow="Live user guide"
      title="Guide / 说明"
      subtitle="Open this when you want the app explained step by step."
      testId="help-page"
      className="help-page"
      actions={
        <>
          <div className="page-hero-actions-row">
            <Link to="/">Today / 今天</Link>
            <Link to="/profile">Profile / 资料</Link>
          </div>
          <div className="help-anchor-nav" aria-label="Guide sections">
            {guideSteps.map((step) => (
              <a key={step.href} href={step.href}>
                {step.label}
              </a>
            ))}
          </div>
        </>
      }
    >
      <section className="timeline-card panel-stack help-intro" id="top">
        <p className="page-row-caption">How to read this page</p>
        <h2 className="paper-title">Start at the top, then scroll down for evidence.</h2>
        <p className="ui-quiet">
          Stay at the top when you are logging quickly. Tap <strong>More</strong> or scroll down when you want
          details, corrections, clusters, or review panels.
        </p>
        <ol className="help-step-list">
          <li>Tap Wake, Feed, Play, Diaper, or Note in the sticky dock to add a stamp.</li>
          <li>When you start a feed, watch the live timer or tap Import duration if you are entering it later.</li>
          <li>Tap More to open the lower panels.</li>
          <li>Scroll down to inspect timeline stamps, interventions, state transitions, feeds, clusters, and correction history.</li>
          <li>Tap a live timeline item to open its correction sheet.</li>
        </ol>
      </section>

      <GuideSection
        stage="Stage 1"
        title="Top of Today"
        summary="This is the main working surface. Keep it visible when you are logging fast, and tap the switcher only when you want a different projection of the same cycle."
        screenshot="/user-guide/01-mobile-top.png"
        annotations={[
          {
            label: 'Timeline / Journal / Compact',
            detail: 'Tap one of these pills to change the projection of the same cycle.',
            destination: 'Today route projection switch',
            x: 39,
            y: 31
          },
          {
            label: 'Profile / 资料',
            detail: 'Tap this link to open the baby profile and language settings screen.',
            destination: '/profile',
            x: 12,
            y: 50
          },
          {
            label: 'View row details',
            detail: 'Tap this to reveal the lower evidence panels below the current summary.',
            destination: 'Timeline stamps, interventions, transitions, feeds, clusters, correction history',
            x: 66,
            y: 63
          },
          {
            label: 'Sticky dock',
            detail: 'Use the pinned dock to stamp Wake, Feed, Play, Diaper, or Note without scrolling back up.',
            destination: 'Quick action dock',
            x: 49,
            y: 87
          }
        ]}
        footer={<p className="ui-quiet">If you are unsure where to tap, start here and use the dock first.</p>}
      />

      <GuideSection
        id="details"
        stage="Stage 2"
        title="Scroll down for detail panels"
        summary="This is where BabyFlow stops being just a summary and starts showing the supporting evidence for the cycle."
        screenshot="/user-guide/02-mobile-details.png"
        annotations={[
          {
            label: 'Timeline stamps',
            detail: 'This list shows the raw stamps you created from the dock and timeline actions.',
            destination: 'Timeline stamps section',
            x: 18,
            y: 28
          },
          {
            label: 'Intervention attempts',
            detail: 'This shows what the caregiver tried, like Soothe, Wait, Pat, Sing, or Wake attempt.',
            destination: 'Intervention attempts section',
            x: 18,
            y: 48
          },
          {
            label: 'State transitions',
            detail: 'This shows the derived baby-state movement such as CRYING → FEEDING.',
            destination: 'State transitions section',
            x: 18,
            y: 68
          },
          {
            label: 'Feed session details',
            detail: 'This shows feed sessions, their left/right segments, and the live or imported duration.',
            destination: 'Feed session details section',
            x: 18,
            y: 87
          }
        ]}
      />

      <GuideSection
        id="corrections"
        stage="Stage 3"
        title="Tap a timeline item to correct it"
        summary="The live timeline stream is the actual chronology. Tap an item to open the correction sheet and update, delete, merge, or undo it."
        screenshot="/user-guide/03-mobile-timeline-sheet.png"
        annotations={[
          {
            label: 'Live timeline item',
            detail: 'Tap a row in the live stream to open the timeline detail sheet.',
            destination: 'TimelineDetailSheet',
            x: 39,
            y: 42
          },
          {
            label: 'Update time / details',
            detail: 'Use these actions when you need to correct the recorded moment or the description.',
            destination: 'Edit correction flow',
            x: 28,
            y: 75
          },
          {
            label: 'Delete / merge / undo',
            detail: 'Use these actions when the item is wrong, duplicated, or needs to be restored.',
            destination: 'Correction history and shared projections',
            x: 74,
            y: 75
          }
        ]}
        footer={<p className="ui-quiet">After correcting something, check correction history and confirm the other projections still match.</p>}
      />

      <GuideSection
        stage="Stage 4"
        title="Switch to Journal when you want the paper view"
        summary="Journal is the paper-compatible row layout. It is the view you use when you want to verify the same cycle in a format that matches the physical journal."
        screenshot="/user-guide/04-mobile-journal.png"
        annotations={[
          {
            label: 'Journal / 记录表',
            detail: 'Tap the Journal pill at the top to switch into the paper-view projection.',
            destination: 'Journal projection',
            x: 51,
            y: 34
          },
          {
            label: 'Editable cells',
            detail: 'Tap a journal cell to open the sheet used to update, delete, merge, or restore that value.',
            destination: 'PaperJournalCellEditSheet',
            x: 27,
            y: 62
          },
          {
            label: 'Compact / 简洁',
            detail: 'Tap this when you want the condensed version with tighter wording.',
            destination: 'Compact projection',
            x: 83,
            y: 34
          }
        ]}
      />

      <GuideSection
        stage="Stage 5"
        title="Review clusters and resolve ambiguous sequences"
        summary="When BabyFlow groups an episode as NEEDS_REVIEW, this is where you inspect it and decide whether the clustering looks right."
        screenshot="/user-guide/05-mobile-review.png"
        annotations={[
          {
            label: 'Timeline clusters',
            detail: 'This panel groups related items into one episode and marks uncertain sequences for review.',
            destination: 'ClusterReviewPanel',
            x: 47,
            y: 25
          },
          {
            label: 'Correction history',
            detail: 'Use this to verify what changed and to restore a deleted item if needed.',
            destination: 'CorrectionHistoryPanel',
            x: 47,
            y: 82
          }
        ]}
        footer={<p className="ui-quiet">If a cluster says NEEDS_REVIEW, scroll back to the live timeline and compare the supporting evidence above it.</p>}
      />

      <section className="timeline-card panel-stack help-intro" id="happy-route">
        <p className="page-row-caption">Happy route</p>
        <h2 className="paper-title">A normal logging sequence</h2>
        <ol className="help-step-list">
          <li>Open Today.</li>
          <li>Tap Wake in the sticky dock.</li>
          <li>Tap Feed in the sticky dock.</li>
          <li>Tap More if you want the lower evidence panels.</li>
          <li>Scroll down to read Timeline stamps, Intervention attempts, State transitions, and Feed session details.</li>
          <li>Tap a live timeline item if you need to edit it.</li>
        </ol>
      </section>

      <section className="timeline-card panel-stack help-intro" id="journal">
        <p className="page-row-caption">Button meaning</p>
        <h2 className="paper-title">What the labels mean</h2>
        <div className="help-inline-grid">
          <article className="help-inline-card">
            <p className="help-callout-label">View buttons</p>
            <p className="help-callout-detail">Timeline shows the live chronology. Journal shows the paper row. Compact shows the condensed row.</p>
          </article>
          <article className="help-inline-card">
            <p className="help-callout-label">Feed timer</p>
            <p className="help-callout-detail">A feed can run live or be imported later with a manual duration. Use the feed card to see both.</p>
          </article>
          <article className="help-inline-card">
            <p className="help-callout-label">Details button</p>
            <p className="help-callout-detail">View row details and Hide row details only open and close the evidence panels below the summary.</p>
          </article>
          <article className="help-inline-card">
            <p className="help-callout-label">Sticky dock</p>
            <p className="help-callout-detail">Use the dock when you want to keep logging without scrolling back to the top.</p>
          </article>
          <article className="help-inline-card">
            <p className="help-callout-label">Correction history</p>
            <p className="help-callout-detail">This is the audit trail for updates, deletes, merges, and restores.</p>
          </article>
        </div>
      </section>

      <section className="timeline-card panel-stack help-intro" id="review">
        <p className="page-row-caption">Rule of thumb</p>
        <h2 className="paper-title">Stay at the top to log, scroll down to inspect</h2>
        <p className="ui-quiet">
          The app is one continuous surface. You usually stay near the top for quick entry, then scroll down when you need
          deeper evidence or correction work, then scroll back up to keep logging.
        </p>
        <div className="page-hero-actions-row">
          <Link to="/">Open Today / 今天</Link>
          <Link to="/profile">Open Profile / 资料</Link>
        </div>
      </section>
    </PageShell>
  );
}
