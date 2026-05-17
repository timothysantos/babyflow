import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StateTransitionViewer } from '../src/client/components/state/StateTransitionViewer';

afterEach(() => {
  cleanup();
});

describe('StateTransitionViewer', () => {
  it('renders a readable state transition list', () => {
    render(
      <StateTransitionViewer
        transitions={[
          {
            id: 'transition_1',
            babyId: 'baby_1',
            fromState: 'CRYING',
            toState: 'FEEDING',
            confidence: 'CONFIRMED',
            recordedAt: '2026-05-16T00:05:00.000Z',
            sourceType: 'feed-session',
            sourceId: 'feed_session_1',
            triggerLabel: 'BREAST feed',
            triggerKind: 'FEED_START'
          }
        ]}
      />
    );

    expect(screen.getByTestId('state-transition-viewer')).toBeTruthy();
    expect(screen.getByTestId('state-transition-list').textContent).toContain('CRYING → FEEDING');
    expect(screen.getByTestId('state-transition-list').textContent).toContain('CONFIRMED');
  });
});
