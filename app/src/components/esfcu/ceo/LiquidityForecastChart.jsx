import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceDot, ResponsiveContainer,
} from 'recharts';
import { CheckCircle2 } from 'lucide-react';
import proj from '../../../data/esfcu/ceo/projection.json';
import ExhibitCard from './ExhibitCard';
import { tierFor, colorFor } from '../../../utils/confidence';
import { NAVY } from './tokens';

// Step 4 — "What happens to liquidity if loan demand keeps outpacing deposits?"
//
// Baseline versus with-campaign, with the academic-calendar seasonality band
// overlaid and the policy ceiling marked. The band is the genuinely new piece —
// nothing in the repo drew a forecast range.
//
// It is a RANGED area (`band: [low, high]`), not a stacked pair. The stacked
// version renders identically but drags the y-axis baseline down to zero,
// because a stack is measured from zero by definition — which flattened a
// six-point spread into a hairline. A range has no baseline, so the explicit
// domain below is respected.
const BASE_COLOR = '#B45309';
const BAND_FILL = 'rgba(0,55,104,0.13)';

const withBand = proj.series.map((d) => ({ ...d, band: [d.band_low, d.band_high] }));

export default function LiquidityForecastChart() {
  const crossing = proj.series.find((d) => d.period === proj.crossing_period);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Loan-to-share projection — baseline versus a deposit campaign"
        note={proj.unit_note}
        source={proj.source}
        asOf={proj.as_of}
        confidence={proj.confidence}
        illustrative
      >
        <div className="w-full min-w-0" style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={withBand} margin={{ top: 20, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                domain={[87.5, 93.5]}
                tickFormatter={(v) => `${v}%`}
                width={48}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'band') return [`${value[0]}% – ${value[1]}%`, 'Seasonality range'];
                  return [`${value}%`, name === 'base' ? 'Baseline (no action)' : 'With deposit campaign'];
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
              />
              <Legend
                verticalAlign="top"
                height={26}
                wrapperStyle={{ fontSize: 10 }}
                formatter={(v) => ({ base: 'Baseline (no action)', campaign: 'With deposit campaign' }[v] || v)}
              />

              {/* Seasonality band — a ranged area, drawn under the lines. */}
              <Area type="monotone" dataKey="band" stroke="none" fill={BAND_FILL} isAnimationActive={false} legendType="none" />

              <ReferenceLine
                y={proj.ceiling_pct}
                stroke={BASE_COLOR}
                strokeDasharray="4 4"
                label={{ value: `${proj.ceiling_label} ${proj.ceiling_pct}%`, fontSize: 9, fill: BASE_COLOR, position: 'insideTopLeft' }}
              />
              <Line type="monotone" dataKey="base" stroke={BASE_COLOR} strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 2 }} animationDuration={900} />
              <Line type="monotone" dataKey="campaign" stroke={NAVY} strokeWidth={2.5} dot={{ r: 2 }} animationDuration={900} />
              {crossing ? (
                <ReferenceDot
                  x={crossing.period}
                  y={crossing.base}
                  r={5}
                  fill={BASE_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                  // 'left' keeps the annotation inside the plot: the crossing is
                  // the last point, so anything anchored right runs off the edge.
                  label={{ value: `${crossing.base}% — ceiling`, position: 'left', fontSize: 9.5, fontWeight: 600, fill: BASE_COLOR }}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* The band has no legend entry of its own — a ranged area is a region,
            not a series, so it is labelled here in words instead. */}
        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-text-subtle">
          <span className="inline-block h-2.5 w-4 flex-shrink-0 rounded-sm" style={{ background: BAND_FILL, border: '1px solid rgba(0,55,104,0.25)' }} />
          Shaded band: the academic-calendar seasonality range around the with-campaign path.
        </p>

        {/* On-hand liquidity against the comfort floor */}
        <div className="mt-3 rounded-lg border border-border-subtle bg-surface-2 px-3 py-2.5">
          <p className="mb-2 text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">
            {proj.liquidity.label} against the {proj.liquidity.floor_label.toLowerCase()} ({proj.liquidity.floor_pct}%)
          </p>
          <div className="flex items-end gap-1.5">
            {proj.liquidity.series.map((p) => {
              const below = p.base < proj.liquidity.floor_pct;
              return (
                <div key={p.period} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className={`text-[9.5px] font-semibold tabular-nums ${below ? 'text-[#B45309]' : 'text-text-muted'}`}>{p.base}%</span>
                  <div className="h-9 w-full rounded-sm bg-surface" style={{ position: 'relative' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-sm"
                      style={{ height: `${Math.max(6, ((p.base - 8.5) / 3.5) * 100)}%`, background: below ? '#B45309' : NAVY, opacity: below ? 0.85 : 0.55 }}
                    />
                  </div>
                  <span className="truncate text-[8.5px] text-text-subtle">{p.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Three resolution paths */}
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {proj.options.map((o) => {
            const confColor = colorFor(tierFor(o.confidence));
            return (
              <div
                key={o.id}
                className={`rounded-lg border p-3 ${o.recommended ? 'border-brand/35 bg-brand/[0.04]' : 'border-border-subtle bg-surface'}`}
              >
                <div className="mb-1 flex items-start justify-between gap-1.5">
                  <p className="text-[11px] font-semibold leading-tight text-text">{o.title}</p>
                  {o.recommended ? (
                    <span className="inline-flex flex-shrink-0 items-center gap-1 rounded bg-brand px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-white">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Rec.
                    </span>
                  ) : null}
                </div>
                <p className="mb-2 text-[10px] leading-snug text-text-muted">{o.description}</p>
                <dl className="mb-2 space-y-0.5">
                  <Attr label="Timeline" value={o.attributes.timeline} />
                  <Attr label="Cost" value={o.attributes.cost} />
                  <Attr label="Liquidity impact" value={o.attributes.liquidity_impact} />
                </dl>
                <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-1.5">
                  <span className="text-[9.5px] font-semibold text-brand">{o.projected_impact}</span>
                  <span className="text-[9.5px] font-semibold tabular-nums" style={{ color: confColor }}>{o.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] leading-snug text-text-subtle">{proj.closing_note}</p>
      </ExhibitCard>
    </motion.div>
  );
}

// Rated attribute. Text carries the rating; the dot is a redundant cue, never
// the only one.
const RATING_TONE = {
  Fast: '#00897B', Low: '#00897B', Strong: '#00897B',
  Moderate: '#B45309', High: '#DC2626', Weak: '#DC2626',
};

function Attr({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-[9.5px] text-text-subtle">{label}</dt>
      <dd className="flex items-center gap-1 text-[9.5px] font-semibold text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: RATING_TONE[value] || '#94a3b8' }} />
        {value}
      </dd>
    </div>
  );
}
