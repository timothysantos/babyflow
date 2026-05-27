import { Link } from 'react-router-dom';

type BaseProps = {
  label: string;
  active?: boolean;
};

type ButtonProps = BaseProps & {
  kind: 'button';
  onClick: () => void;
  ariaPressed?: boolean;
};

type LinkProps = BaseProps & {
  kind: 'link';
  to: string;
};

type Props = ButtonProps | LinkProps;

export function TodayPill(props: Props) {
  const className = `today-pill${props.active ? ' is-active' : ''}`;

  if (props.kind === 'link') {
    return (
      <Link to={props.to} className={className}>
        {props.label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} aria-pressed={props.ariaPressed ?? props.active ?? false} onClick={props.onClick}>
      {props.label}
    </button>
  );
}
