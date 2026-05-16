import { QuickActionButton } from './QuickActionButton';

const actions = ['Wake', 'Feed', 'Burp', 'Diaper', 'Put Down', 'Asleep', 'Note', 'More'] as const;

export function QuickActionDock() {
  return (
    <nav aria-label="Quick actions" className="quick-action-dock" data-testid="quick-action-dock">
      {actions.map((action) => (
        <QuickActionButton key={action} label={action} />
      ))}
    </nav>
  );
}
