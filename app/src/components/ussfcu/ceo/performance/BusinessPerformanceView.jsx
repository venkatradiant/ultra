import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import perf from '../../../../data/ussfcu/ceo/performance.json';
import { tierFor, colorFor } from '../../../../utils/confidence';

const NAVY = 'var(--color-brand)';
const GOLD = '#C2A24C';

// Interpolate the navy → gold ramp across n segments (spec: bars in the ramp).
function ramp(i, n) {
  const t = n <= 1 ? 0 : i / (n - 1);
  const a = [0x00, 0x30, 0x87];
  const b = [0xc2, 0xa2, 0x4c];
  const m = a.map((c, k) => Math.round(c + (b[k] - c) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

function ExhibitCard({ title, note, source, asOf, confidence, className = '', children }) {
  const confColor = colorFor(tierFor(confidence));
  return (
    <div className={`bg-surface rounded-2xl border border-border-subtle p-4 flex flex-col ${className}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-[13px] font-semibold text-text">{title}</h3>
          {note ? <p className="text-[10.5px] text-text-subtle mt-0.5 leading-snug">{note}</p> : null}
        </div>
        {confidence != null ? (
          <span className="flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums" style={{ color: confColor, background: `${confColor}14` }}>
            {confidence}% conf.
          </span>
        ) : null}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
      {(source || asOf) ? (
        <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-2">
          <span className="text-[9.5px] text-text-subtle">{source}</span>
          {asOf ? <span className="text-[9.5px] text-text-subtle">as of {asOf}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({ kpi }) {
  const data = kpi.spark.map((v, i) => ({ i, v }));
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-3.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <p className="text-[10px] font-medium text-text-subtle uppercase tracking-wide">{kpi.label}</p>
      <p className="text-[22px] font-bold text-text leading-none mt-1 tabular-nums">{kpi.value}</p>
      <div className="flex items-end justify-between mt-1.5">
        <span className={`text-[10px] font-semibold ${kpi.positive ? 'text-emerald-600' : 'text-amber-600'}`}>{kpi.delta}</span>
        <div className="w-16 h-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 3, right: 0, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="v" stroke={NAVY} strokeWidth={1.75} dot={false} animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function RampBars({ items, valueFmt }) {
  const max = Math.max(...items.map((it) => it.value));
  return (
    <div className="space-y-2.5">
      {items.map((it, idx) => (
        <div key={it.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-text-muted truncate pr-2">{it.name}</span>
            <span className="text-[11px] font-semibold text-text tabular-nums flex-shrink-0">{valueFmt(it)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(it.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
              className="h-full rounded-full"
              style={{ background: ramp(idx, items.length) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BusinessPerformanceView() {
  const a = perf.assetGrowth;
  const lp = perf.loanPortfolio;
  const dp = perf.deposits;
  const geo = perf.geography;
  const cap = perf.capital;
  const out = perf.outlook;

  const inflection = a.series.find((p) => p.q === a.inflectionPeriod);
  const currentIdx = out.milestones.findIndex((m) => m.state === 'current');
  const progressPct = currentIdx >= 0 ? (currentIdx / (out.milestones.length - 1)) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex-1 overflow-y-auto scrollbar-sleek px-6 pt-6 pb-10">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">Business Performance</h2>
        <p className="text-[12px] text-text-muted mb-5 max-w-2xl">
          The executive roll-up of USSFCU — assets and growth, loan portfolio, deposits, membership and geography,
          and capital — at board altitude, each exhibit shown with its source, as-of date, and confidence.
        </p>

        {/* KPI cards with sparklines */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {perf.kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
        </div>

        {/* Asset growth + capital */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <ExhibitCard className="lg:col-span-2" title={a.title} source={a.source} asOf={a.asOf} confidence={a.confidence}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={a.series} margin={{ top: 16, right: 20, left: -6, bottom: 0 }}>
                <defs>
                  <linearGradient id="assetFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={NAVY} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={NAVY} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="q" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                  domain={[1.3, 1.6]}
                  tickFormatter={(v) => `$${v.toFixed(2)}B`}
                  width={54}
                />
                <Tooltip formatter={(v) => [`$${v}B`, 'Total assets']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                <Area type="monotone" dataKey="assets" stroke={NAVY} strokeWidth={2.5} fill="url(#assetFill)" animationDuration={900} />
                {inflection ? (
                  <ReferenceDot
                    x={inflection.q} y={inflection.assets} r={5} fill={GOLD} stroke="#fff" strokeWidth={2}
                    label={{ value: a.inflectionLabel, position: 'top', fontSize: 11, fontWeight: 600, fill: '#8a6d1f' }}
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </ExhibitCard>

          <ExhibitCard title={cap.title} note={cap.note} source={cap.source} asOf={cap.asOf} confidence={cap.confidence}>
            <div className="flex flex-col items-center justify-center h-full py-2">
              <div className="flex items-center gap-1.5 text-[#00897B] mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px] font-semibold">{cap.status}</span>
              </div>
              <p className="text-[46px] font-bold text-text leading-none tabular-nums">{cap.netWorthRatio.toFixed(2)}%</p>
              <p className="text-[10px] text-text-subtle mt-1">Net worth ratio</p>
              <div className="w-full mt-4">
                <div className="relative h-2.5 rounded-full bg-surface-2 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(cap.netWorthRatio / 10) * 100}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full bg-brand" />
                  <div className="absolute top-0 bottom-0" style={{ left: `${(cap.wellCapThreshold / 10) * 100}%` }}>
                    <div className="w-px h-full bg-[#00897B]" />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-text-subtle">0%</span>
                  <span className="text-[9px] font-semibold text-[#00897B]">{cap.wellCapThreshold.toFixed(2)}% well-cap</span>
                  <span className="text-[9px] text-text-subtle">10%</span>
                </div>
              </div>
            </div>
          </ExhibitCard>
        </div>

        {/* Loan portfolio donut + deposits + geography */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <ExhibitCard title={lp.title} source={lp.source} asOf={lp.asOf} confidence={lp.confidence}>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={lp.segments} dataKey="pct" nameKey="name" innerRadius={44} outerRadius={62} paddingAngle={2} startAngle={90} endAngle={-270} animationDuration={900}>
                      {lp.segments.map((s, i) => <Cell key={s.name} fill={ramp(i, lp.segments.length)} stroke="#fff" strokeWidth={1.5} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[17px] font-bold text-text leading-none tabular-nums">{lp.total}</span>
                  <span className="text-[8.5px] text-text-subtle mt-0.5">{lp.totalLabel}</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {lp.segments.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: ramp(i, lp.segments.length) }} />
                    <span className="text-[10.5px] text-text-muted flex-1 truncate">{s.name}</span>
                    <span className="text-[10.5px] font-semibold text-text tabular-nums">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ExhibitCard>

          <ExhibitCard title={dp.title} note={`Total shares ${dp.total}`} source={dp.source} asOf={dp.asOf} confidence={dp.confidence}>
            <RampBars items={dp.segments.map((s) => ({ name: s.name, value: s.pct }))} valueFmt={(it) => `${it.value}%`} />
          </ExhibitCard>

          <ExhibitCard title={geo.title} note={geo.note} source={geo.source} asOf={geo.asOf} confidence={geo.confidence}>
            <RampBars items={geo.regions.map((r) => ({ name: r.region, value: r.members }))} valueFmt={(it) => it.value.toLocaleString()} />
          </ExhibitCard>
        </div>

        {/* Strategic outlook milestone timeline */}
        <ExhibitCard title={out.title} source={out.source} asOf={out.asOf} confidence={out.confidence}>
          <div className="pt-4 pb-2 px-2">
            <div className="relative">
              {/* base track */}
              <div className="absolute left-0 right-0 top-[7px] h-1 rounded-full bg-surface-2" />
              {/* gold progress fill on the completed segment */}
              <motion.div
                className="absolute left-0 top-[7px] h-1 rounded-full"
                style={{ background: GOLD }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              <div className="relative flex justify-between">
                {out.milestones.map((m) => {
                  const done = m.state === 'done';
                  const current = m.state === 'current';
                  return (
                    <div key={m.label} className="flex flex-col items-center text-center" style={{ width: `${100 / out.milestones.length}%` }}>
                      <div className={`w-[15px] h-[15px] rounded-full flex items-center justify-center ${done ? 'bg-[#C2A24C]' : current ? 'bg-brand' : 'bg-surface border-2 border-border'}`}>
                        {done ? <CheckCircle2 className="w-3 h-3 text-white" /> : current ? <Circle className="w-2 h-2 text-white fill-white" /> : null}
                      </div>
                      <span className={`text-[10px] mt-2 leading-tight ${current ? 'font-semibold text-brand' : 'text-text-muted'}`}>{m.label}</span>
                      <span className="text-[9px] text-text-subtle mt-0.5">{m.when}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ExhibitCard>
      </div>
    </div>
  );
}
