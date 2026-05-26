import { QuickActionButton } from './QuickActionButton';

const actions = ['Wake', 'Left feed', 'Right feed', 'Formula', 'Diaper', 'Sleep', 'Note', 'More'] as const;

type Props = {
  onAction: (action: (typeof actions)[number]) => void;
};

export function QuickActionDock({ onAction }: Props) {
  return (
    <nav aria-label="Add to timeline" className="quick-action-dock" data-testid="quick-action-dock">
      <p className="paper-heading quick-action-heading">Add to timeline</p>
      {actions.map((action) => (
        <QuickActionButton key={action} label={action} onClick={() => onAction(action)} />
      ))}
    </nav>
  );
}
