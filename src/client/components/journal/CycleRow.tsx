import { useState } from 'react';
import { CycleRowExpandedDetails } from './CycleRowExpandedDetails';

export function CycleRow() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="cycle-row" data-testid="cycle-row">
      <div className="cycle-row-scroll" data-testid="cycle-row-scroll">
        <div className="cycle-row-fields">WAKE | FEED | PLAY | PUT DOWN | SLEEP</div>
      </div>
      <button type="button" onClick={() => setExpanded((value) => !value)}>
        {expanded ? 'Hide details' : 'Show details'}
      </button>
      {expanded ? <CycleRowExpandedDetails /> : null}
    </section>
  );
}
