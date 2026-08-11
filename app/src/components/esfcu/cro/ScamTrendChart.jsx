import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ExhibitCard from '../shared/ExhibitCard';
import trend from '../../../data/esfcu/cro/scamTrend.json';
import { NAVY_HEX } from '../tokens';

/**
 * Spec §10 Step 2: "trend chart of scam cases over 8 weeks with channel
 * breakdown". Stacked by channel on purpose — the story is that the growth is
 * concentrated in digital banking and ACH, which is invisible on a single total
 * line, and a stack is the one chart where the parts and the whole are both
 * readable at once.
 *
 * (Contrast the CEO's forecast, where a stack would have been wrong: stacking a
 * confidence band forces the y-axis to zero and flattens the very movement the
 * exhibit exists to show. Same library, opposite answer, because the question
 * is different.)
 */

// Labels come from the fixture so the legend, the summary row and the tooltip
// can never drift apart; only the colour ramp lives here.
const CHANNEL_COLOR = {
  digital: NAVY_HEX,
  ach: '#2E6DA4',
  card: '#7FA8C9',
  branch: '#C7D7E4',
};

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((n, p) => n + (p.value || 0), 0);
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold text-text">Week ending {label}</p>
      {payload.slice().reverse().map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          {p.name} <span className="ml-auto font-semibold tabular-nums text-text">{p.value}</span>
        </p>
      ))}
      <p className="mt-1 border-t border-border-subtle pt-1 text-[10px] font-bold text-text">
        Total <span className="tabular-nums">{total}</span>
      </p>
    </div>
  );
}

export default function ScamTrendChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Scam and impersonation cases — trailing eight weeks"
        note={`${trend.recent_30_days} cases in the last 30 days, up from ${trend.prior_30_days} in the 30 before — ${trend.growth_pct}% growth, concentrated in digital banking and ACH.`}
        source={trend.source}
        asOf={trend.as_of}
        confidence={trend.confidence}
        provenance={trend.provenance}
      >
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {trend.channels.map((c) => (
            <div key={c.key} className="min-w-0">
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">{c.label}</p>
              <p className="text-[13px] font-bold tabular-nums text-text">{c.total}</p>
            </div>
          ))}
        </div>

        <div className="w-full min-w-0" style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend.series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#7A8A99' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A8A99' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={24}
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: '#5A6B7B' }}
              />
              {trend.channels.map((c) => (
                <Area
                  key={c.key}
                  type="monotone"
                  dataKey={c.key}
                  name={c.label}
                  stackId="cases"
                  stroke={CHANNEL_COLOR[c.key]}
                  fill={CHANNEL_COLOR[c.key]}
                  fillOpacity={0.85}
                  strokeWidth={1}
                  animationDuration={900}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-2 border-t border-border-subtle pt-2 text-[10.5px] leading-relaxed text-text-muted">
          {trend.callout}
        </p>
      </ExhibitCard>
    </motion.div>
  );
}
