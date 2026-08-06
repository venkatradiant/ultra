/**
 * The Dashboard's three charts.
 *
 * Kept in one module because they share a tooltip style and an axis
 * convention, and splitting them into three files would make that consistency
 * something to remember rather than something the code enforces.
 *
 * Colours come from the theme's chart palette where the series is categorical
 * (charge type) and from the semantic scale where it is not (confidence, which
 * means auto-resolve / review / escalate and must match the pills elsewhere).
 */
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { TrendingUp, Target, Zap } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const TOOLTIP = {
  contentStyle: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '11.5px',
  },
};

const AXIS_TICK = { fontSize: 10, fill: 'var(--color-text-subtle)' };

// Confidence bands mean auto-resolve / operator review / SME escalation, so
// they reuse the semantic scale rather than the categorical palette.
const CONFIDENCE_FILL = {
  '>95%': '#059669',
  '90-95%': '#10B981',
  '85-90%': '#F59E0B',
  '80-85%': '#F97316',
  '70-80%': '#EF4444',
  '<70%': '#DC2626',
};

const CHARGE_FILL = [
  'var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)',
  'var(--color-chart-4)', 'var(--color-chart-5)', 'var(--color-chart-6)',
];

function Panel({ title, icon: Icon, note, children }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
          <Icon className="w-4 h-4 text-brand" /> {title}
        </h3>
        <div className="flex items-center gap-2">
          {note && <span className="text-[10.5px] text-text-subtle">{note}</span>}
          <IllustrativeChip />
        </div>
      </div>
      {children}
    </div>
  );
}

export function AnomalyTrendChart({ data = [] }) {
  if (!data.length) return null;
  return (
    <Panel title="Anomaly Trend — Last 6 Cycles" icon={TrendingUp} note="Detected vs resolved">
      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="cycle" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44} />
            <Tooltip {...TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: '10.5px' }} iconSize={8} />
            <Area type="monotone" dataKey="detected" name="Detected" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.12} strokeWidth={2} />
            <Area type="monotone" dataKey="autoFixed" name="Auto-Fixed" stroke="#10B981" fill="#10B981" fillOpacity={0.12} strokeWidth={2} />
            <Area type="monotone" dataKey="escalated" name="Escalated" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10.5px] text-text-subtle mt-2 leading-relaxed">
        Detection volume is roughly flat across six cycles while auto-resolution has climbed — the gap
        between the two lines is the review load that no longer reaches an operator.
      </p>
    </Panel>
  );
}

export function ConfidenceDistributionPanel({ data = [] }) {
  if (!data.length) return null;
  return (
    <Panel title="Confidence Distribution" icon={Target} note="Current cycle">
      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="range" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} />
            <Tooltip cursor={{ fill: 'var(--color-surface-2)' }} {...TOOLTIP} />
            <Bar dataKey="count" name="Anomalies" radius={[4, 4, 0, 0]}>
              {data.map((d) => (<Cell key={d.range} fill={CONFIDENCE_FILL[d.range] || 'var(--color-chart-1)'} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10.5px] text-text-subtle mt-2 leading-relaxed">
        115 of the 202 scored anomalies clear 90% and auto-resolve. The 18 below 80% are the ones that
        actually consume operator time.
      </p>
    </Panel>
  );
}

export function ChargeTypeDonut({ data = [] }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Panel title="Anomalies by Charge Type" icon={Zap}>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={46} outerRadius={74} paddingAngle={2} dataKey="value">
              {data.map((d, i) => (<Cell key={d.name} fill={CHARGE_FILL[i % CHARGE_FILL.length]} />))}
            </Pie>
            <Tooltip {...TOOLTIP} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-2 justify-center">
        {data.map((d, i) => (
          <span key={d.name} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: CHARGE_FILL[i % CHARGE_FILL.length] }} />
            <span className="text-[10.5px] text-text-muted">{d.name}</span>
            <span className="text-[10.5px] font-semibold text-text tabular-nums">{d.value.toLocaleString()}</span>
          </span>
        ))}
      </div>
      <p className="text-[10.5px] text-text-subtle mt-2.5 text-center tabular-nums">
        {total.toLocaleString()} anomalies across six charge types
      </p>
    </Panel>
  );
}
