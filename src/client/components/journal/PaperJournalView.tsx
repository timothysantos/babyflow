import type { PaperJournalRowViewModel } from './paper-journal.types';

type Props = {
  rows: PaperJournalRowViewModel[];
  onEditCell?: (key: keyof PaperJournalRowViewModel, label: string, value: string) => void;
};

const columns = [
  { key: 'wakeUpTime', label: 'Wake Up Time / 醒来的时间' },
  { key: 'startOfFeedTime', label: 'Start of Feed Time / 开始喂奶的时间' },
  { key: 'feedSummary', label: 'Feed / 奶量' },
  { key: 'startOfPlayTime', label: 'Start of Play Time / 开始玩的时间' },
  { key: 'startOfSleepTime', label: 'Start of Sleep Time / 开始睡的时间' },
  { key: 'sleepDuration', label: 'Sleep Duration / 睡眠时间' },
  { key: 'urine', label: 'Urine / 小便' },
  { key: 'stool', label: 'Stool / 大便' },
  { key: 'remarks', label: 'Remarks / 其他笔记' }
] as const;

export function PaperJournalView({ rows, onEditCell }: Props) {
  return (
    <section className="timeline-card panel-stack" data-testid="paper-journal-view" aria-label="Paper journal view">
      <div>
        <p className="section-label">Journal</p>
        <h2 className="today-title">Paper Journal View / 记录表</h2>
        <p className="today-subtitle">Matches the physical paper journal row model.</p>
      </div>
      <div className="paper-journal-list" data-testid="paper-journal-scroll">
        {rows.map((row) => (
          <article key={row.cycleId} className="paper-journal-row-card" data-testid="paper-journal-row">
            <header className="paper-journal-row-header">
              <p className="paper-heading">{row.rowStatus}</p>
              <p className="paper-journal-row-id">{row.cycleId}</p>
            </header>
            <ol className="paper-journal-row-items">
              {columns.map((column) => {
                const value = row[column.key as keyof PaperJournalRowViewModel] as {
                  display: string;
                  source: string;
                  needsReview: boolean;
                };
                return (
                  <li key={column.key} className="paper-journal-row-item" data-source={value.source} data-needs-review={value.needsReview ? 'true' : 'false'}>
                    <span className="paper-journal-row-label">{column.label}</span>
                    <button
                      type="button"
                      className="paper-journal-value paper-journal-value-button"
                      data-testid={`paper-journal-cell-${column.key}`}
                      onClick={() => onEditCell?.(column.key as keyof PaperJournalRowViewModel, column.label, value.display)}
                    >
                      {value.display}
                    </button>
                  </li>
                );
              })}
            </ol>
          </article>
        ))}
      </div>
      <p className="paper-journal-legend">
        Blank cells are intentional when the row has not yet captured that journal column.
      </p>
    </section>
  );
}
