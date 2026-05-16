import { MobileShell } from '../layouts/MobileShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { SingleRowCycleLogger } from '../components/journal/SingleRowCycleLogger';

export function TodayPage() {
  return (
    <MobileShell>
      <main className="today-page" data-testid="today-page">
        <h1 className="today-title">Today / 今天</h1>
        <p className="today-subtitle">BabyFlow paper journal</p>
        <SingleRowCycleLogger />
        <div className="compact-mode" data-testid="compact-mode">
          <p>Compact mode scaffolded.</p>
        </div>
        <QuickActionDock />
      </main>
    </MobileShell>
  );
}
