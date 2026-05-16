import type { PropsWithChildren } from 'react';

export function MobileShell({ children }: PropsWithChildren) {
  return (
    <div className="mobile-shell" data-testid="mobile-shell">
      {children}
    </div>
  );
}
