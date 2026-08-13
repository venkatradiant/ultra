import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge, PlatformChip } from '../shared/TrustBits';
import { useAdminState } from '../shared/adminState';
import { CROSS_SURVEY, PLATFORM_COLORS, PORTFOLIO_SURVEYS } from '../../../data/doit/_shared/constants';

/**
 * The headline moment: one question answered across six surveys and three
 * third-party platforms, cited back to its sources.
 *
 * The trend line is the part that only a cross-survey view can show — each
 * individual survey is a point, and the decline is only visible when they are
 * read together against the portal launch.
 */
const SATISFACTION_TREND = [
  { period: 'Q4 2024', pct: 80, note: 'Before the portal' },
  { period: 'Q1 2025', pct: 76, note: 'Portal launches' },
  { period: 'Q2 2025', pct: 72, note: 'Current wave' },
];

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-text">{label}</p>
      <p className="text-[11px] text-text-muted">
        Satisfaction <span className="font-semibold tabular-nums text-text">{row.pct}%</span>
      </p>
      <p className="text-[10.5px] italic text-text-subtle">{row.note}</p>
    </div>
  );
}

export default function CrossSurveyInsightCard() {
  const { selectedSurveys } = useAdminState();
  const inScope = PORTFOLIO_SURVEYS.filter((s) => selectedSurveys.includes(s.id));
  const total = inScope.reduce((sum, s) => sum + s.responses, 0);
  const platforms = [...new Set(inScope.map((s) => s.platform))];

  return (
    <DoitCard
      eyebrow="Cross-survey insight"
      title="Wait times are the number-one complaint"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={91} />
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {platforms.map((p) => (
          <PlatformChip key={p} platform={p} color={PLATFORM_COLORS[p]} />
        ))}
        <span className="text-[11px] text-text-muted">
          · {inScope.length} surveys · {total.toLocaleString()} responses
        </span>
      </div>

      <ul className="mb-4 space-y-2">
        <Finding stat={`${CROSS_SURVEY.waitTimesSharePct}%`}>
          of open-text responses across these surveys cite wait times — the number-one complaint.
        </Finding>
        <Finding stat={`${CROSS_SURVEY.topThemeIn} of ${CROSS_SURVEY.topThemeOf}`}>
          surveys show wait times as the top theme. The pattern holds across platforms and authors,
          which is what makes it structural rather than an artefact of one instrument.
        </Finding>
        <Finding stat={`+${CROSS_SURVEY.waitTimesDeltaPct}%`} trend>
          against Q1 — the trend is worsening quarter over quarter.
        </Finding>
      </ul>

      <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        Satisfaction across the portfolio
      </p>
      <div className="h-[136px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={SATISFACTION_TREND} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
            <CartesianGrid stroke="var(--color-chart-grid)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
            <YAxis domain={[60, 90]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
            <Tooltip content={<TrendTooltip />} />
            <Line
              type="monotone"
              dataKey="pct"
              stroke="var(--color-chart-1)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: 'var(--color-chart-1)' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-text-muted">
        Down {CROSS_SURVEY.satisfactionStart - CROSS_SURVEY.satisfactionEnd} points across 2024–2025.
        The steepest drop sits between Q4 and Q1, alongside the new online renewal portal.
      </p>
    </DoitCard>
  );
}

function Finding({ stat, trend, children }) {
  return (
    <li className="flex items-baseline gap-3">
      <span className="flex w-[70px] flex-shrink-0 items-baseline gap-1 text-[16px] font-bold text-brand">
        {trend && <TrendingUp className="h-3.5 w-3.5 self-center text-warning" aria-hidden="true" />}
        {stat}
      </span>
      <span className="min-w-0 text-[12.5px] leading-relaxed text-text">{children}</span>
    </li>
  );
}
