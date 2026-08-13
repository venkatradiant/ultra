import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DoitCard from '../shared/DoitCard';
import { AiDisclaimer, ConfidenceBadge } from '../shared/TrustBits';
import { SURVEY_1_FINDINGS } from '../../../data/doit/_shared/constants';

/**
 * The wait-times theme, opened up.
 *
 * The chart is the point of the drill-down: the headline number says wait times
 * dominate, but the reason that is actionable is the channel split — in-person
 * is where the complaints are, and online is already better. A single stat
 * cannot say that; a two-bar comparison can.
 */
const CHANNELS = [
  { channel: 'In-person service centers', pct: 61 },
  { channel: 'Phone', pct: 26 },
  { channel: 'Online portal', pct: 13 },
];

function ChannelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-text">{row.channel}</p>
      <p className="text-[11px] text-text-muted">
        <span className="font-semibold tabular-nums text-text">{row.pct}%</span> of wait-time comments
      </p>
    </div>
  );
}

export default function WaitTimesInsightCard() {
  return (
    <DoitCard
      eyebrow="Theme detail"
      title="Wait times"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <AiDisclaimer />
          <ConfidenceBadge score={92} />
        </div>
      }
    >
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-[28px] font-bold leading-none text-brand">
          {SURVEY_1_FINDINGS.waitTimesSharePct}%
        </span>
        <span className="text-[12.5px] text-text-muted">of open-text comments</span>
      </div>

      <p className="mb-3 text-[13px] leading-relaxed text-text">
        The most common dissatisfaction theme by far. Residents describe delays at in-person service
        centers, especially for permit-related requests. Online channels are rated noticeably better —
        which is where the fix is likely to be cheapest.
      </p>

      <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-muted">
        Where the complaints land
      </p>
      <div className="h-[132px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={CHANNELS} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }}>
            <XAxis type="number" domain={[0, 70]} hide />
            <YAxis
              type="category"
              dataKey="channel"
              width={150}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            />
            <Tooltip cursor={{ fill: 'var(--color-surface-2)' }} content={<ChannelTooltip />} />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={18} label={{ position: 'right', fontSize: 11, fill: 'var(--color-text)', formatter: (v) => `${v}%` }}>
              {CHANNELS.map((row, i) => (
                <Cell key={row.channel} fill={`var(--color-chart-${i === 0 ? 1 : i + 2})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[12px] leading-relaxed text-text-muted">
        This is the area most likely to move your overall satisfaction score if addressed.
      </p>
    </DoitCard>
  );
}
