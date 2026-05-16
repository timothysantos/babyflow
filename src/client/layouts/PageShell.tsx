import type { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  testId?: string;
};

export function PageShell({ eyebrow, title, subtitle, actions, children, className = '', testId }: Props) {
  return (
    <main className={`page-shell ${className}`.trim()} data-testid={testId}>
      <section className="page-hero page-surface">
        <div className="page-hero-copy">
          {eyebrow ? <p className="page-eyebrow">{eyebrow}</p> : null}
          <h1 className="page-title">{title}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-hero-actions">{actions}</div> : null}
      </section>
      {children}
    </main>
  );
}
