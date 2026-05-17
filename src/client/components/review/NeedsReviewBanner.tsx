type Props = {
  count: number;
};

export function NeedsReviewBanner({ count }: Props) {
  if (count === 0) return null;

  return (
    <section className="timeline-card panel-stack" data-testid="needs-review-banner" aria-label="Timeline review needed">
      <p className="paper-heading">Needs review</p>
      <p className="ui-quiet">{count} cluster{count === 1 ? '' : 's'} need review before replay/drift.</p>
    </section>
  );
}
