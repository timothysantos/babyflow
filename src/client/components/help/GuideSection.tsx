import type { ReactNode } from 'react';

type Annotation = {
  label: string;
  detail: string;
  destination: string;
  x: number;
  y: number;
};

type Props = {
  id?: string;
  stage: string;
  title: string;
  summary: string;
  screenshot: string;
  annotations: Annotation[];
  footer?: ReactNode;
};

export function GuideSection({ id, stage, title, summary, screenshot, annotations, footer }: Props) {
  return (
    <section className="timeline-card panel-stack help-stage" id={id}>
      <p className="page-row-caption">{stage}</p>
      <h2 className="paper-title">{title}</h2>
      <p className="ui-quiet">{summary}</p>
      <div className="help-stage-layout">
        <figure className="help-screenshot" aria-label={title}>
          <img src={screenshot} alt={title} />
          <div className="help-markers" aria-hidden="true">
            {annotations.map((annotation, index) => (
              <span
                key={`${annotation.label}-${index}`}
                className="help-marker"
                style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
              >
                {index + 1}
              </span>
            ))}
          </div>
        </figure>
        <div className="help-callouts" aria-label={`${title} annotations`}>
          {annotations.map((annotation, index) => (
            <article key={`${annotation.label}-${index}`} className="help-callout">
              <p className="help-callout-index">↗ Step {index + 1}</p>
              <p className="help-callout-label">{annotation.label}</p>
              <p className="help-callout-detail">{annotation.detail}</p>
              <p className="help-callout-destination">Opens: {annotation.destination}</p>
            </article>
          ))}
        </div>
      </div>
      {footer ? <div className="help-footer">{footer}</div> : null}
    </section>
  );
}
