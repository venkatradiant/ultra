import { motion } from 'framer-motion';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Users, TrendingDown } from 'lucide-react';
import ExhibitCard from '../shared/ExhibitCard';
import { provenanceOf } from '../shared/provenance';
import forecast from '../../../data/esfcu/cro/forecast.json';
import { NAVY_HEX, STATE_COLOR } from '../tokens';

/**
 * Spec §10 Step 4: "forecast chart of projected cases and loss, baseline vs
 * with-response, with the attrition risk called out."
 *
 * The band is a RANGED area — `band: [low, high]` on one Area — not two stacked
 * Areas. A stacked pair forces recharts to anchor the y-axis at zero, which
 * flattens a 36→58 movement into a barely visible wobble. Same lesson the CEO's
 * liquidity forecast learned.
 *
 * The attrition figure gets its own callout rather than a chart line, because
 * it is the one number on this screen that is real and is NOT about ESFCU. Put
 * on the axis it would read as a modelled ESFCU projection; in a callout that
 * names Abrigo, it reads as what it is.
 */

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const byKey = Object.fromEntries(payload.map((p) => [p.dataKey, p.value]));
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold text-text">Week ending {label}</p>
      {byKey.actual != null ? (
        <p className="text-[10px] text-text-muted">Actual <span className="ml-2 font-semibold tabular-nums text-text">{byKey.actual}</span></p>
      ) : (
        <>
          <p className="text-[10px] text-text-muted">
            Baseline <span className="ml-2 font-semibold tabular-nums" style={{ color: STATE_COLOR.warning }}>{byKey.baseline}</span>
          </p>
          <p className="text-[10px] text-text-muted">
            With response <span className="ml-2 font-semibold tabular-nums" style={{ color: STATE_COLOR.good }}>{byKey.response}</span>
          </p>
        </>
      )}
    </div>
  );
}

function Outcome({ label, value, sub, color }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[9.5px] font-semibold uppercase tracking-wide text-text-subtle">{label}</p>
      <p className="text-[15px] font-bold leading-tight tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[9.5px] leading-snug text-text-subtle">{sub}</p>
    </div>
  );
}

export default function ExposureForecastChart() {
  const o = forecast.outcome;
  const a = forecast.attrition;
  const prov = provenanceOf(a.provenance);
  // The band only exists on the projected weeks; the observed ones carry a
  // zero-width band so the shape starts at the handover rather than floating.
  const lastActual = forecast.series.filter((p) => p.actual != null).slice(-1)[0];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <ExhibitCard
        title="Two-week exposure — baseline against the modelled response"
        note={forecast.unit_note}
        source={forecast.source}
        asOf={forecast.as_of}
        confidence={forecast.confidence}
        provenance={forecast.provenance}
      >
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2">
          <Outcome label="If nothing changes" value={o.baseline_loss_display} sub={`${o.baseline_cases} cases · ${forecast.catch_rate.baseline_pct}% caught pre-loss`} color={STATE_COLOR.warning} />
          <Outcome label="With the response" value={o.response_loss_display} sub={`${o.response_cases} cases · ${forecast.catch_rate.response_pct}% caught pre-loss`} color={STATE_COLOR.good} />
          <Outcome label="Loss avoided" value={o.avoided_loss_display} sub={`Over the ${o.horizon}`} color={NAVY_HEX} />
        </div>

        <div className="w-full min-w-0" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast.series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#7A8A99' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#7A8A99' }} axisLine={false} tickLine={false} width={28} domain={['dataMin - 6', 'dataMax + 6']} />
              <Tooltip content={<ForecastTooltip />} />

              {/* Ranged band, one Area. Stacking two would zero-anchor the axis. */}
              <Area type="monotone" dataKey="band" stroke="none" fill={STATE_COLOR.warning} fillOpacity={0.1} isAnimationActive={false} />

              <ReferenceLine
                x={lastActual?.week}
                stroke="#B9C6D2"
                strokeDasharray="4 4"
                label={{ value: 'Observed → projected', position: 'insideTopLeft', fill: '#7A8A99', fontSize: 9 }}
              />

              <Line type="monotone" dataKey="actual" name="Actual" stroke={NAVY_HEX} strokeWidth={2.5} dot={{ r: 3, fill: NAVY_HEX }} connectNulls={false} animationDuration={900} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke={STATE_COLOR.warning} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: STATE_COLOR.warning }} animationDuration={900} />
              <Line type="monotone" dataKey="response" name="With response" stroke={STATE_COLOR.good} strokeWidth={2} dot={{ r: 3, fill: STATE_COLOR.good }} animationDuration={900} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9.5px] text-text-subtle">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: NAVY_HEX }} /> Observed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: STATE_COLOR.warning }} /> Baseline</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ background: STATE_COLOR.good }} /> With response</span>
        </div>

        {/* The attrition callout. Marked `industry`, and it says out loud that
            ESFCU has not measured its own — the distinction the three-state
            provenance exists for. */}
        <div className="mt-3 rounded-xl border border-border-subtle bg-surface-2 p-3">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Users className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">Attrition risk</span>
            <span className={`rounded px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide ${prov.className}`} title={prov.title}>
              {prov.label}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold tabular-nums text-[#B45309]">
              <TrendingDown className="h-3 w-3" /> +{a.relative_uplift_pct}% more likely to leave
            </span>
          </div>
          <p className="text-[10.5px] leading-relaxed text-text-muted">{a.text}</p>
          <p className="mt-1 text-[9.5px] text-text-subtle">{a.members_note} Source: {a.sourceCitation}.</p>
        </div>
      </ExhibitCard>
    </motion.div>
  );
}
