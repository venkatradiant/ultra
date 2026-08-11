import { motion } from 'framer-motion';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import data from '../../../data/esfcu/ceo/loansVsShares.json';
import ExhibitCard from '../shared/ExhibitCard';
import { NAVY, ACCENT } from '../tokens';

// Step 2 — "Walk me through the liquidity signal."
// Dual-line loans versus shares over eight quarters on the left axis, with the
// loan-to-share ratio as an annotated overlay on the right axis and the internal
// policy ceiling marked. The gap between the two balance lines IS the story, so
// they share one axis and one scale rather than being normalised apart.
// The two balance series are the categorical pair (navy shares, amber loans).
// The ratio is a different KIND of quantity on its own axis, so it gets a
// neutral graphite rather than a third brand hue — otherwise it reads as a third
// peer series and competes with the loans line it is derived from. The ceiling
// keeps the warning colour, because that one IS a threshold.
const RATIO_COLOR = '#475569';
const CEILING_COLOR = '#B45309';

export default function LoansVsSharesChart() {
  const s = data.summary;
  const last = data.series[data.series.length - 1];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Loans versus shares — trailing eight quarters"
        note={data.unit_note}
        source={data.source}
        asOf={data.as_of}
        confidence={data.confidence}
        // Mixed: real endpoints, constructed series. The card claims the
        // weaker of the two, and the per-figure markers carry the rest.
        provenance="illustrative"
      >
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5">
          <Stat label="Loan growth, YoY" value={`+${s.loan_growth_yoy_pct}%`} tone="warn" />
          <Stat label="Share growth, YoY" value={`+${s.share_growth_yoy_pct}%`} tone="muted" />
          <Stat label="Loan-to-share" value={`${s.loan_to_share_pct}%`} tone="warn" />
          <Stat label="On-hand liquidity" value={`${s.on_hand_liquidity_pct}%`} tone="muted" />
        </div>

        <div className="w-full min-w-0" style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.series} margin={{ top: 8, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="bal"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={[880, 1220]}
                tickFormatter={(v) => `$${(v / 1000).toFixed(2)}B`}
                width={58}
              />
              <YAxis
                yAxisId="ratio"
                orientation="right"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[82, 94]}
                tickFormatter={(v) => `${v}%`}
                width={38}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'ratio') return [`${value}%`, 'Loan-to-share'];
                  return [`$${(value / 1000).toFixed(3)}B`, name === 'loans' ? 'Total loans' : 'Total shares'];
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
              />
              <Legend
                verticalAlign="top"
                height={26}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(v) => ({ loans: 'Total loans', shares: 'Total shares', ratio: 'Loan-to-share (right)' }[v] || v)}
              />
              <ReferenceLine
                yAxisId="ratio"
                y={data.policy_ceiling_pct}
                stroke={CEILING_COLOR}
                strokeDasharray="4 4"
                // Left, not right: the series terminate at the right edge and the
                // label sat on top of them.
                label={{ value: `${data.policy_ceiling_label} ${data.policy_ceiling_pct}%`, fontSize: 9, fill: CEILING_COLOR, position: 'insideTopLeft' }}
              />
              <Line yAxisId="bal" type="monotone" dataKey="shares" stroke={NAVY} strokeWidth={2.5} dot={{ r: 2 }} animationDuration={900} />
              <Line yAxisId="bal" type="monotone" dataKey="loans" stroke={ACCENT} strokeWidth={2.5} dot={{ r: 2 }} animationDuration={900} />
              <Line yAxisId="ratio" type="monotone" dataKey="ratio" stroke={RATIO_COLOR} strokeWidth={1.75} strokeDasharray="3 3" dot={false} animationDuration={900} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-2 text-[10px] leading-snug text-text-subtle">
          <span className="font-semibold text-text-muted">{last.period}: {last.ratio}%</span> — {data.callouts[0].text}. {data.real_anchor_note}
        </p>
      </ExhibitCard>
    </motion.div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
      <p className={`text-[15px] font-bold tabular-nums leading-tight ${tone === 'warn' ? 'text-[#B45309]' : 'text-text'}`}>{value}</p>
    </div>
  );
}
