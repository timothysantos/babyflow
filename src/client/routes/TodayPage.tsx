import { useEffect, useState } from 'react';
import { MobileShell } from '../layouts/MobileShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { SingleRowCycleLogger } from '../components/journal/SingleRowCycleLogger';

export function TodayPage() {
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('babyflow.today.compactMode');
    setCompactMode(stored === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.compactMode', String(compactMode));
  }, [compactMode]);

  return (
    <MobileShell>
      <main className="today-page" data-testid="today-page">
        <h1 className="today-title">Today / 今天</h1>
        <p className="today-subtitle">BabyFlow paper journal</p>
        <button type="button" onClick={() => setCompactMode((value) => !value)}>
          {compactMode ? 'Compact mode on' : 'Compact mode off'}
        </button>
        <SingleRowCycleLogger />
        <div className="compact-mode" data-testid="compact-mode" data-compact-mode={compactMode ? 'on' : 'off'}>
          {compactMode ? <p>Compact mode active.</p> : <p>Compact mode scaffolded.</p>}
        </div>
        <QuickActionDock />
      </main>
    </MobileShell>
  );
}
