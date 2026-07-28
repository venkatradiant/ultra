import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { ArrowRight, Server, Wrench, RefreshCw } from 'lucide-react';
import metrics from '../../../data/newfold-digital/quality/metrics.json';

const nodeIcon = { cause: Server, mid: Wrench, effect: RefreshCw };
const nodeStyle = {
  cause: 'border-amber-200 bg-amber-500/[0.05] text-amber-600',
  mid: 'border-border bg-surface-2 text-text-muted',
  effect: 'border-red-200 bg-red-500/[0.05] text-red-600',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{label}</p>
      <p className="text-brand">Refund FCR: {d.fcr}%</p>
      <p className="text-red-500">1-star refund reviews: {d.reviewNeg}</p>
    </div>
  );
}

export default function RepeatContactCorrelation() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Repeat Contact Driver Analysis</h3>
      <p className="text-[11px] text-text-subtle mb-3">One IT incident, an agent workaround, and a callback pattern — traced end to end.</p>
      <div className="flex items-stretch gap-2 mb-4 flex-wrap">
        {metrics.correlationChain.map((n, i) => {
          const Icon = nodeIcon[n.tone] || Server;
          const last = i === metrics.correlationChain.length - 1;
          return (
            <div key={i} className="flex items-center gap-2 flex-1 min-w-[140px]">
              <div className={`flex-1 rounded-lg border px-3 py-2 ${nodeStyle[n.tone]}`}>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <p className="text-[10px] font-bold leading-tight">{n.node}</p>
                </div>
                <p className="text-[9px] text-text-muted mt-1 leading-snug">{n.detail}</p>
              </div>
              {!last ? <ArrowRight className="w-4 h-4 text-text-subtle flex-shrink-0" /> : null}
            </div>
          );
        })}
      </div>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Refund FCR + One-Star Review Overlay — Nov 22 inflection</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={metrics.repeatFcr} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 9.5, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="fcr" domain={[50, 90]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
          <YAxis yAxisId="rev" orientation="right" domain={[0, 40]} tick={{ fontSize: 9, fill: '#ef4444' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <ReferenceLine yAxisId="fcr" x="Nov 22" stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'IT incident', fontSize: 9, fill: '#f59e0b', position: 'top' }} />
          <Line yAxisId="fcr" type="monotone" dataKey="fcr" name="Refund FCR" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line yAxisId="rev" type="monotone" dataKey="reviewNeg" name="1-star refund reviews" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2.5 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 rounded-lg bg-red-500/[0.05] px-3 py-2">
        <p className="text-[10px] text-red-600 font-semibold">→ Refund FCR fell 82% → 55%; negative sentiment spilling into one-star reviews (+34%).</p>
      </div>
    </div>
  );
}
