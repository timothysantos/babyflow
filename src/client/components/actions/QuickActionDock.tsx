import { QuickActionButton } from './QuickActionButton';

const actions = ['Wake note', 'Feed note', 'Burp note', 'Diaper note', 'Sleep note', 'More'] as const;

export function QuickActionDock() {
  return (
    <nav aria-label="Quick actions" className="quick-action-dock" data-testid="quick-action-dock">
      {actions.map((action) => (
        <QuickActionButton key={action} label={action} />
      ))}
    </nav>
  );
}
