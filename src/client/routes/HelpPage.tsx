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
        <h2 className="paper-title">Stay at the top for care. Open details only when you need evidence.</h2>
        <p className="ui-quiet">
          Today is the fast logging surface. Tap <strong>Details</strong> only when you want the supporting logs,
          correction history, caregiver attempts, baby state, or feed records.
        </p>
        <ol className="help-step-list">
          <li>Tap Wake, Left feed, Right feed, Formula, Play, Diaper, or Note in the sticky dock to add a stamp.</li>
          <li>Left feed, Right feed, and Formula start or switch the active feed segment stopwatch.</li>
          <li>When a feed is active, use the Feeding now card for the live timer, left/right/formula/note, edit time, or close feed.</li>
          <li>Use Today log for the latest visible chronology.</li>
          <li>Tap Details to inspect stamps, caregiver attempts, baby state, feeds, and correction history.</li>
          <li>Tap a Today log item to open its correction sheet.</li>
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
            label: 'Details',
            detail: 'Tap this to reveal the supporting logs below the current operational view.',
            destination: 'Stamps, tried actions, baby state, feeds, and history',
            x: 66,
            y: 63
          },
          {
            label: 'Sticky dock',
            detail: 'Use the pinned dock to stamp Wake, feed segments, Play, Diaper, Note, or More without scrolling back up.',
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
        title="Open details when you need proof"
        summary="This is where BabyFlow shows the supporting evidence for the current care sequence without crowding the default Today screen."
        screenshot="/user-guide/02-mobile-details.png"
        annotations={[
          {
            label: 'Stamps',
            detail: 'This list shows the raw entries you created from quick actions.',
            destination: 'Stamps section',
            x: 18,
            y: 28
          },
          {
            label: 'Tried',
            detail: 'This shows what the caregiver tried, like Soothe, Wait, Pat, Sing, or Wake attempt.',
            destination: 'Tried section',
            x: 18,
            y: 48
          },
          {
            label: 'Baby state',
            detail: 'This shows derived movement such as CRYING → FEEDING.',
            destination: 'Baby state section',
            x: 18,
            y: 68
          },
          {
            label: 'Feeds',
            detail: 'This shows feed sessions, their left/right segments, and the live or imported duration.',
            destination: 'Feeds section',
            x: 18,
            y: 87
          }
        ]}
      />

      <GuideSection
        id="corrections"
        stage="Stage 3"
        title="Tap a Today log item to correct it"
        summary="Today log is the visible chronology preview. Tap an item to open the correction sheet and update, delete, merge, or undo it."
        screenshot="/user-guide/03-mobile-timeline-sheet.png"
        annotations={[
          {
            label: 'Today log item',
            detail: 'Tap a row in Today log to open the timeline detail sheet.',
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
        title="Needs checking"
        summary="When BabyFlow marks something as needing checking, this is where you inspect it and decide whether the grouping looks right."
        screenshot="/user-guide/05-mobile-review.png"
        annotations={[
          {
            label: 'Needs checking',
            detail: 'This panel groups related items into one episode and marks uncertain sequences for checking.',
            destination: 'Needs checking panel',
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
        footer={<p className="ui-quiet">If a cycle says needs checking, scroll back to the live timeline and compare the supporting evidence above it.</p>}
      />

      <section className="timeline-card panel-stack help-intro" id="happy-route">
        <p className="page-row-caption">Happy route</p>
        <h2 className="paper-title">A normal logging sequence</h2>
        <ol className="help-step-list">
          <li>Open Today.</li>
          <li>Tap Wake in the sticky dock.</li>
          <li>Tap Left feed, Right feed, or Formula in the sticky dock to start the feed with the correct segment.</li>
          <li>If a feed is live, use the Feeding now card to follow the guidance, switch segments, edit time, or close feed.</li>
          <li>Tap Details if you want the supporting panels.</li>
          <li>Scroll down to read stamps, tried actions, baby state, and feed records.</li>
          <li>Tap a Today log item if you need to edit it.</li>
        </ol>
      </section>

      <section className="timeline-card panel-stack help-intro" id="journal">
        <p className="page-row-caption">Button meaning</p>
        <h2 className="paper-title">What the labels mean</h2>
        <div className="help-inline-grid">
          <article className="help-inline-card">
            <p className="help-callout-label">View buttons</p>
            <p className="help-callout-detail">Timeline shows Today log. Journal shows the paper row. Compact shows the condensed row.</p>
          </article>
          <article className="help-inline-card">
            <p className="help-callout-label">Feed timer</p>
            <p className="help-callout-detail">A feed can run live or be imported later with a manual duration. Use the feed card to see both.</p>
          </article>
          <article className="help-inline-card">
            <p className="help-callout-label">Details button</p>
            <p className="help-callout-detail">Details and Hide details only open and close the supporting panels below Today.</p>
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
        <h2 className="paper-title">Stay near the top to log, open details to inspect</h2>
        <p className="ui-quiet">
          The app is one continuous surface, but Today is intentionally short. You usually stay near the top for quick entry,
          then open Details or Review when you need deeper evidence or correction work.
        </p>
        <div className="page-hero-actions-row">
          <Link to="/">Open Today / 今天</Link>
          <Link to="/profile">Open Profile / 资料</Link>
        </div>
      </section>
    </PageShell>
  );
}
