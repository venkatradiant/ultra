import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import metrics from '../../../data/newfold-digital/workforce/metrics.json';

const data = metrics.cohortRamp;
const topicColor = { hosting: '#ef4444', domains: '#f59e0b', billing: '#10b981' };

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text capitalize">{d.topic} · adherence {d.adherence}%</p>
      <p className="text-text-muted">Handle time {Math.floor(d.handleTime)}:{String(Math.round((d.handleTime % 1) * 60)).padStart(2, '0')}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">Week {label.replace('W', '')}</p>
      <p className="text-brand">Nov cohort: {payload[0].value} min</p>
      <p className="text-text-muted">Benchmark: {payload[1].value} min</p>
    </div>
  );
}

export default function CohortRampCurve() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Handle Time by Week — November Cohort vs Benchmark</h3>
      <p className="text-[11px] text-text-subtle mb-3">Target 9:30 by week 6. The cohort is stalled at 15:10 — KB adherence {metrics.cohortAdherence} vs {metrics.cohortBenchmark} benchmark.</p>
      <ResponsiveContainer width="100%" height={210}>
        <LineChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="m" />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={9.5} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Target 9:30', fontSize: 9, fill: '#94a3b8', position: 'insideBottomRight' }} />
          <Line type="monotone" dataKey="cohort" name="Nov cohort" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 border-t border-border-subtle pt-3">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Knowledge-Base Adherence by Agent (flagged by topic)</p>
        <ResponsiveContainer width="100%" height={150}>
          <ScatterChart margin={{ top: 6, right: 12, left: -18, bottom: 2 }}>
            <XAxis type="number" dataKey="adherence" name="Adherence" unit="%" domain={[40, 95]} tick={{ fontSize: 9.5, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis type="number" dataKey="handleTime" name="Handle time" unit="m" domain={[9, 19]} tick={{ fontSize: 9.5, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <ZAxis range={[60, 60]} />
            <ReferenceLine x={85} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: '85% target', fontSize: 8.5, fill: '#94a3b8', position: 'top' }} />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={metrics.kbAdherenceScatter}>
              {metrics.kbAdherenceScatter.map((d, i) => <Cell key={i} fill={topicColor[d.topic]} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-3 text-[9px] text-text-muted -mt-1">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Hosting</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Domains</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Billing</span>
        </div>
      </div>
      <div className="mt-2 rounded-lg bg-amber-500/[0.06] px-3 py-2">
        <p className="text-[10px] text-amber-700 font-semibold">→ The 5 agents below 60% adherence cluster in hosting & domain troubleshooting. Needs ~3 more weeks — don't count the cohort in the Dec 8 plan.</p>
      </div>
    </div>
  );
}
