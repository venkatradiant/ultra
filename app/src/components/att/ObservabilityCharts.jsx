/**
 * The Agent Observability charts.
 *
 * The latency chart is the one that matters. Three lines — mean, P95, P99 —
 * because the diagnosis in spec §10B step 2 is precisely that the *tail* moved,
 * not the mean, and a single average line would make that unsayable. It is also
 * why the P99 gets the heaviest stroke: an agent at 1250ms against a fleet P99
 * of 830ms is above the tail of every other agent, which is the actual finding.
 */
import {
  AreaChart, Area, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, Timer, AlertTriangle } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';

const TOOLTIP = {
  contentStyle: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '11.5px',
  },
};
const AXIS_TICK = { fontSize: 10, fill: 'var(--color-text-subtle)' };

function Panel({ title, icon: Icon, note, children, footer }) {
  return (
    <MaximizablePanel className="p-4 sm:p-5 min-w-0" label="Chart">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
          <Icon className="w-4 h-4 text-brand" /> {title}
        </h3>
        <div className="flex items-center gap-2">
          {note && <span className="text-[10.5px] text-text-subtle">{note}</span>}
          <span className="flex items-center gap-2"><IllustrativeChip /><MaximizeButton /></span>
        </div>
      </div>
      {children}
      {footer && <p className="text-[10.5px] text-text-subtle mt-2.5 leading-relaxed">{footer}</p>}
    </MaximizablePanel>
  );
}

export function AccuracyTrendChart({ data = [] }) {
  if (!data.length) return null;
  return (
    <Panel title="Accuracy Trend" icon={TrendingUp} note="Fleet mean · 20 days">
      <div className="h-[200px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} domain={[93, 98]} />
            <Tooltip {...TOOLTIP} />
            <Area type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" fill="#10B981" fillOpacity={0.14} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function LatencyChart({ data = [], degradedAgent = null }) {
  if (!data.length) return null;
  return (
    <Panel
      title="Average Latency — Avg / P95 / P99"
      icon={Timer}
      note="20 days"
      footer={
        degradedAgent
          ? `${degradedAgent.name} is running at ${degradedAgent.latencyMs}ms — above the fleet P99 for every day in this window. It is slow, not wrong: accuracy is holding at ${degradedAgent.accuracy}%.`
          : null
      }
    >
      <div className="h-[200px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            {/* The domain has to clear the degraded agent's latency, or the
                reference line marking it sits above the plot and is clipped —
                which would hide the one mark the whole diagnosis rests on. */}
            <YAxis
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              width={44}
              unit="ms"
              domain={[0, (dataMax) => Math.max(dataMax, degradedAgent?.latencyMs ?? 0) * 1.12]}
              allowDecimals={false}
            />
            <Tooltip {...TOOLTIP} />
            <Legend wrapperStyle={{ fontSize: '10.5px' }} iconSize={8} />
            {degradedAgent && (
              <ReferenceLine
                y={degradedAgent.latencyMs}
                stroke="#DC2626"
                strokeDasharray="4 4"
                label={{ value: `${degradedAgent.name.replace(' Agent', '')} ${degradedAgent.latencyMs}ms`, position: 'insideTopRight', fontSize: 9.5, fill: '#DC2626' }}
              />
            )}
            <Line type="monotone" dataKey="latency" name="Avg Latency" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="p95" name="P95" stroke="var(--color-chart-2)" strokeWidth={1.75} dot={false} />
            <Line type="monotone" dataKey="p99" name="P99" stroke="var(--color-chart-4)" strokeWidth={2.25} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function FailureRateChart({ data = [], summary = null }) {
  if (!data.length) return null;
  return (
    <Panel
      title="Failure Rate"
      icon={AlertTriangle}
      note={summary ? `${summary.failures} of ${summary.total.toLocaleString()}` : null}
      footer={
        summary
          ? `${summary.windowRate}% across the window. The fleet has more than halved its failure rate over 20 days — the remaining errors concentrate in one agent, and they are timeouts rather than wrong answers.`
          : null
      }
    >
      <div className="h-[200px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} unit="%" />
            <Tooltip {...TOOLTIP} />
            <Area type="monotone" dataKey="rate" name="Failure rate %" stroke="#DC2626" fill="#DC2626" fillOpacity={0.12} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
