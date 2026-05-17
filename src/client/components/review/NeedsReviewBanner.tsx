type Props = {
  count: number;
};

export function NeedsReviewBanner({ count }: Props) {
  if (count === 0) return null;

  return (
    <section className="timeline-card panel-stack" data-testid="needs-review-banner" aria-label="Needs checking">
      <p className="paper-heading">Needs checking</p>
      <p className="ui-quiet">{count} cycle{count === 1 ? '' : 's'} need checking before review.</p>
    </section>
  );
}
