import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge, PlatformChip } from '../shared/TrustBits';
import { useAdminState } from '../shared/adminState';
import { PLATFORM_COLORS, PORTFOLIO_SURVEYS } from '../../../data/doit/_shared/constants';

/**
 * The same finding, cut by source instead of geography.
 *
 * Hand-drawn bars rather than recharts here on purpose: this is a table with a
 * magnitude column, and each row carries a platform chip and a response count
 * that a chart axis would have to drop. The regional cut is the one that earns a
 * real chart, because there the comparison IS the point.
 */
const WAIT_TIME_SHARE = {
  s1: { pct: 44, top: true },
  s2: { pct: 51, top: true },
  s3: { pct: 38, top: true },
  s4: { pct: 47, top: true },
  s5: { pct: 22, top: false },
  s6: { pct: 19, top: false },
};

export default function SurveyBreakdownCard() {
  const { selectedSurveys } = useAdminState();
  const rows = PORTFOLIO_SURVEYS.filter((s) => selectedSurveys.includes(s.id))
    .map((s) => ({ ...s, ...WAIT_TIME_SHARE[s.id] }))
    .sort((a, b) => b.pct - a.pct);
  const topCount = rows.filter((r) => r.top).length;

  return (
    <DoitCard
      eyebrow="Wait-time complaints by survey"
      intro="Share of each survey's open-text responses citing wait times."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={90} />
        </div>
      }
    >
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.id}>
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-text">{row.name}</span>
              <PlatformChip platform={row.platform} color={PLATFORM_COLORS[row.platform]} />
              {row.top && (
                <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-brand">
                  Top theme
                </span>
              )}
              <span className="w-9 flex-shrink-0 text-right text-[12px] font-semibold tabular-nums text-text">
                {row.pct}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.pct}%`,
                  background: row.top ? 'var(--color-chart-1)' : 'var(--color-chart-8)',
                }}
              />
            </div>
            <p className="mt-0.5 text-[10.5px] text-text-subtle">
              {row.responses} responses · {row.period}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[12px] leading-relaxed text-text-muted">
        Wait times lead in {topCount} of {rows.length}. The two where they do not are the Q1 surveys —
        which is the same story the trend line tells, seen from a different angle.
      </p>
    </DoitCard>
  );
}
