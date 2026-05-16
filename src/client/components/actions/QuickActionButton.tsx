type Props = {
  label: string;
  onClick?: () => void;
};

export function QuickActionButton({ label, onClick }: Props) {
  return (
    <button type="button" className="quick-action-button" onClick={onClick}>
      {label}
    </button>
  );
}
