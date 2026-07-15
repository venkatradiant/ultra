import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Coins, TrendingDown } from 'lucide-react';

/**
 * Tokenomics Dashboard (per-person / period) — totals, token split, monthly trend,
 * savings vs LLM-only, and per-persona spend. Data: { person, role, period, total,
 * turns, slmPct, llmPct, savings, llmOnlyCost, trend[], byPersona[] }.
 */
export default function TokenomicsDashboard({ data }) {
  if (!data) return null;
  const maxPersona = Math.max(...(data.byPersona || []).map((p) => p.cost), 1);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center">
          <Coins className="w-3.5 h-3.5 text-brand" />
        </span>
        <div>
          <div className="text-[12px] font-semibold text-text leading-tight">{data.person} · Tokenomics</div>
          <div className="text-[10px] text-text-subtle">{data.role} · {data.period}</div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Total spend', value: `$${data.total.toFixed(2)}` },
          { label: 'Turns', value: data.turns },
          { label: 'SLM / LLM', value: `${data.slmPct}/${data.llmPct}` },
          { label: 'Saved vs LLM-only', value: `$${data.savings.toFixed(0)}`, accent: true },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-surface-2 px-3 py-2">
            <div className={`text-base font-bold tabular-nums ${s.accent ? 'text-emerald-600' : 'text-text'}`}>{s.value}</div>
            <div className="text-[9.5px] text-text-subtle uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trend */}
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Weekly spend trend</div>
      <div className="h-36 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.trend} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} width={32} tickFormatter={(v) => `$${v}`} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)' }} formatter={(v) => [`$${v}`, 'Spend']} />
            <Line type="monotone" dataKey="cost" stroke="var(--color-brand)" strokeWidth={2} dot={{ r: 2.5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-persona */}
      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Spend by persona · {data.period}</div>
      <div className="space-y-2">
        {(data.byPersona || []).map((p) => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-text-muted">{p.name}</span>
              <span className="text-[11px] font-semibold text-text tabular-nums">${p.cost.toFixed(2)} <span className="text-text-subtle font-normal">· {p.slmPct}% SLM</span></span>
            </div>
            <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(p.cost / maxPersona) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-1.5">
        <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[11px] font-medium text-text-muted">
          Sovereignty routing saved <span className="font-bold text-emerald-700">${data.savings.toFixed(0)}</span> this month vs. processing everything on the LLM (${data.llmOnlyCost.toFixed(2)}).
        </span>
      </div>
    </motion.div>
  );
}
