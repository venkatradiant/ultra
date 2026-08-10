import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import perf from '../../../../data/esfcu/ceo/performance.json';
import ExhibitCard from '../ExhibitCard';
import { NAVY_HEX, ACCENT } from '../tokens';

// `/journey`, relabelled "Business Performance" for this persona. The executive
// roll-up: assets and growth, capital, the loan and deposit composition, the
// education-calendar seasonality, membership, and the funding-plan outlook —
// each exhibit with its source, as-of date and confidence.

const ACCENT_HEX = '#B45309';

// Interpolate the navy → amber ramp across n segments.
function ramp(i, n) {
  const t = n <= 1 ? 0 : i / (n - 1);
  const a = [0x00, 0x37, 0x68];
  const b = [0xb4, 0x53, 0x09];
  const m = a.map((c, k) => Math.round(c + (b[k] - c) * t));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}

function KpiCard({ kpi }) {
  const data = kpi.spark.map((v, i) => ({ i, v }));
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-3.5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-1.5">
        <p className="min-w-0 truncate text-[10px] font-medium uppercase tracking-wide text-text-subtle">{kpi.label}</p>
        <span
          className={`flex-shrink-0 rounded px-1 py-px text-[8px] font-bold uppercase tracking-wide ${
            kpi.real ? 'bg-[#00897B]/10 text-[#00897B]' : 'bg-surface-2 text-text-subtle'
          }`}
        >
          {kpi.real ? 'Real' : 'Illus.'}
        </span>
      </div>
      <p className="mt-1 text-[22px] font-bold leading-none tabular-nums text-text">{kpi.value}</p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <span className={`min-w-0 truncate text-[10px] font-semibold ${kpi.positive ? 'text-emerald-600' : 'text-amber-600'}`}>{kpi.delta}</span>
        <div className="h-6 w-16 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 3, right: 0, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="v" stroke={NAVY_HEX} strokeWidth={1.75} dot={false} animationDuration={900} />
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
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate pr-2 text-[11px] text-text-muted">{it.name}</span>
            <span className="flex-shrink-0 text-[11px] font-semibold tabular-nums text-text">{valueFmt(it)}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
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
  const mem = perf.membership;
  const seas = perf.seasonality;
  const cap = perf.capital;
  const out = perf.outlook;

  const inflection = a.series.find((p) => p.q === a.inflectionPeriod);
  const currentIdx = out.milestones.findIndex((m) => m.state === 'current');
  const progressPct = currentIdx >= 0 ? (currentIdx / (out.milestones.length - 1)) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="scrollbar-sleek flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-6">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">Business Performance</h2>
        <p className="mb-5 max-w-2xl text-[12px] text-text-muted">
          The executive roll-up of ESFCU — assets and capital, the loan and deposit composition, the education-calendar
          deposit cycle, membership across the field of membership, and the funding plan — at board altitude, each
          exhibit shown with its source, as-of date and confidence.
        </p>

        {/* KPI cards with sparklines */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {perf.kpis.map((k) => <KpiCard key={k.id} kpi={k} />)}
        </div>

        {/* Asset growth + capital */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ExhibitCard className="lg:col-span-2" title={a.title} note={a.note} source={a.source} asOf={a.asOf} confidence={a.confidence}>
            <div className="w-full min-w-0" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={a.series} margin={{ top: 16, right: 20, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="esfcuAssetFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={NAVY_HEX} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={NAVY_HEX} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="q" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false} tickLine={false}
                    domain={a.domain}
                    tickFormatter={(v) => `$${v.toFixed(2)}B`}
                    width={54}
                  />
                  <Tooltip formatter={(v) => [`$${v}B`, 'Total assets']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                  <Area type="monotone" dataKey="assets" stroke={NAVY_HEX} strokeWidth={2.5} fill="url(#esfcuAssetFill)" animationDuration={900} />
                  {inflection ? (
                    <ReferenceDot
                      x={inflection.q} y={inflection.assets} r={5} fill={ACCENT_HEX} stroke="#fff" strokeWidth={2}
                      label={{ value: a.inflectionLabel, position: 'top', fontSize: 11, fontWeight: 600, fill: '#8a6d1f' }}
                    />
                  ) : null}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ExhibitCard>

          <ExhibitCard title={cap.title} note={cap.note} source={cap.source} asOf={cap.asOf} confidence={cap.confidence} real>
            <div className="flex h-full flex-col items-center justify-center py-2">
              <div className="mb-1 flex items-center gap-1.5 text-[#00897B]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[11px] font-semibold">{cap.status}</span>
              </div>
              <p className="text-[46px] font-bold leading-none tabular-nums text-text">{cap.netWorthRatio.toFixed(2)}%</p>
              <p className="mt-1 text-[10px] text-text-subtle">Net worth ratio</p>
              <div className="mt-4 w-full">
                <div className="relative h-2.5 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cap.netWorthRatio / 12) * 100}%` }}
                    transition={{ duration: 0.9 }}
                    className="h-full rounded-full bg-brand"
                  />
                  <div className="absolute bottom-0 top-0" style={{ left: `${(cap.wellCapThreshold / 12) * 100}%` }}>
                    <div className="h-full w-px bg-[#00897B]" />
                  </div>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-[9px] text-text-subtle">0%</span>
                  <span className="text-[9px] font-semibold text-[#00897B]">{cap.wellCapThreshold.toFixed(2)}% well-cap</span>
                  <span className="text-[9px] text-text-subtle">12%</span>
                </div>
              </div>
            </div>
          </ExhibitCard>
        </div>

        {/* Loan portfolio + deposit mix + membership */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ExhibitCard title={lp.title} note={lp.note} source={lp.source} asOf={lp.asOf} confidence={lp.confidence}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={lp.segments} dataKey="pct" nameKey="name" innerRadius={44} outerRadius={62} paddingAngle={2} startAngle={90} endAngle={-270} animationDuration={900}>
                      {lp.segments.map((s, i) => <Cell key={s.name} fill={ramp(i, lp.segments.length)} stroke="#fff" strokeWidth={1.5} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[17px] font-bold leading-none tabular-nums text-text">{lp.total}</span>
                  <span className="mt-0.5 text-[8.5px] text-text-subtle">{lp.totalLabel}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                {lp.segments.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 flex-shrink-0 rounded-sm" style={{ background: ramp(i, lp.segments.length) }} />
                    <span className="min-w-0 flex-1 truncate text-[10.5px] text-text-muted">{s.name}</span>
                    <span className="text-[10.5px] font-semibold tabular-nums text-text">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ExhibitCard>

          <ExhibitCard title={dp.title} note={`${dp.note} Total shares ${dp.total}.`} source={dp.source} asOf={dp.asOf} confidence={dp.confidence}>
            <RampBars items={dp.segments.map((s) => ({ name: s.name, value: s.pct }))} valueFmt={(it) => `${it.value}%`} />
          </ExhibitCard>

          <ExhibitCard title={mem.title} note={mem.note} source={mem.source} asOf={mem.asOf} confidence={mem.confidence}>
            <RampBars items={mem.segments.map((r) => ({ name: r.region, value: r.members }))} valueFmt={(it) => it.value.toLocaleString()} />
          </ExhibitCard>
        </div>

        {/* Deposit seasonality — the education calendar */}
        <ExhibitCard
          className="mb-4"
          title={seas.title}
          note={seas.note}
          source={seas.source}
          asOf={seas.asOf}
          confidence={seas.confidence}
          illustrative
        >
          <div className="w-full min-w-0" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seas.series} margin={{ top: 16, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="esfcuSeasonFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT_HEX} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={ACCENT_HEX} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                  domain={[96.5, 102.5]}
                  tickFormatter={(v) => v.toFixed(0)}
                  width={40}
                />
                <Tooltip formatter={(v) => [v, 'Share balance index']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }} />
                <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Annual mean', fontSize: 9, fill: '#94a3b8', position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="index" stroke={ACCENT_HEX} strokeWidth={2.5} fill="url(#esfcuSeasonFill)" animationDuration={900} />
                <ReferenceDot x={seas.drawMonth} y={seas.series.find((p) => p.m === seas.drawMonth)?.index} r={5} fill={ACCENT_HEX} stroke="#fff" strokeWidth={2} label={{ value: 'Summer draw', position: 'bottom', fontSize: 10, fontWeight: 600, fill: '#8a6d1f' }} />
                <ReferenceDot x={seas.inflowMonth} y={seas.series.find((p) => p.m === seas.inflowMonth)?.index} r={5} fill={NAVY_HEX} stroke="#fff" strokeWidth={2} label={{ value: 'Inflow window', position: 'top', fontSize: 10, fontWeight: 600, fill: NAVY_HEX }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ExhibitCard>

        {/* Funding-plan outlook */}
        <ExhibitCard title={out.title} note={out.note} source={out.source} asOf={out.asOf} confidence={out.confidence} illustrative>
          <div className="px-2 pb-2 pt-4">
            <div className="relative">
              <div className="absolute left-0 right-0 top-[7px] h-1 rounded-full bg-surface-2" />
              <motion.div
                className="absolute left-0 top-[7px] h-1 rounded-full"
                style={{ background: ACCENT }}
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
                      <div className={`flex h-[15px] w-[15px] items-center justify-center rounded-full ${done ? 'bg-[#B45309]' : current ? 'bg-brand' : 'border-2 border-border bg-surface'}`}>
                        {done ? <CheckCircle2 className="h-3 w-3 text-white" /> : current ? <Circle className="h-2 w-2 fill-white text-white" /> : null}
                      </div>
                      <span className={`mt-2 text-[10px] leading-tight ${current ? 'font-semibold text-brand' : 'text-text-muted'}`}>{m.label}</span>
                      <span className="mt-0.5 text-[9px] text-text-subtle">{m.when}</span>
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
