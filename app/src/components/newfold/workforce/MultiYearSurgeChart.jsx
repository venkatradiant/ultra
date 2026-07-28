import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from 'recharts';
import metrics from '../../../data/newfold-digital/workforce/metrics.json';

const data = metrics.surgeOverlay;

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-text mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

export default function MultiYearSurgeChart() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Q4 Contact Volume — 2023 vs 2024 vs 2025 (Projected)</h3>
      <p className="text-[11px] text-text-subtle mb-3">Index vs baseline (100). The 2025 projection exceeds staffing capacity across the Dec 8–15 peak.</p>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
          <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Area type="monotone" dataKey="capacity" name="Staffing capacity" stroke="#94a3b8" fill="#e2e8f0" fillOpacity={0.5} strokeDasharray="4 4" />
          <Line type="monotone" dataKey="y2023" name="2023" stroke="#cbd5e1" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="y2024" name="2024" stroke="#93c5fd" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="y2025" name="2025 (projected)" stroke="var(--color-brand)" strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 rounded-lg bg-red-500/[0.05] px-3 py-2">
        <p className="text-[10px] text-red-600 font-semibold">→ 38% projected increase, peak Dec 8–15. Current plan covers 26% of it — a 24-agent gap.</p>
      </div>
    </div>
  );
}
