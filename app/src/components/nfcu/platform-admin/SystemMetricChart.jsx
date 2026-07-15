import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Activity } from 'lucide-react';

/**
 * Inline System Metric Chart — masks Grafana: a Gen UI line chart (router CPU +
 * p95 latency) plus an event-history list, pulled via API and re-rendered in
 * Ultra. Data: { title, subtitle, series[], events[] }.
 */
const levelDot = { critical: 'bg-red-500', warning: 'bg-amber-500', info: 'bg-brand' };

export default function SystemMetricChart({ data }) {
  if (!data?.series) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-surface rounded-xl border border-border-subtle p-5"
    >
      <div className="flex items-center gap-2 mb-0.5">
        <Activity className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold text-text">{data.title}</h3>
      </div>
      <p className="text-xs text-text-subtle mb-4">{data.subtitle}</p>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.series} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" vertical={false} />
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} width={30} tickFormatter={(v) => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--color-chart-axis)' }} axisLine={false} tickLine={false} width={36} tickFormatter={(v) => `${v}ms`} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--color-border)' }} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <Line yAxisId="left" type="monotone" dataKey="cpu" name="Router CPU %" stroke="var(--color-brand)" strokeWidth={2} dot={{ r: 2 }} />
            <Line yAxisId="right" type="monotone" dataKey="latency" name="p95 latency" stroke="#7c3aed" strokeWidth={2} dot={{ r: 2 }} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.events?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Event history</div>
          <ul className="space-y-1.5">
            {data.events.map((e, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="text-[10px] font-mono text-text-subtle w-10 flex-shrink-0">{e.time}</span>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${levelDot[e.level] || 'bg-brand'}`} />
                <span className="text-[11px] text-text-muted">{e.event}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
