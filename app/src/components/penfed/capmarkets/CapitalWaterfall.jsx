import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import scenarios from '../../../data/penfed/capmarkets/scenarios.json';

const c = scenarios.consolidated_capital_impact;

const data = [
  { label: 'Current', value: c.current_capital_ratio * 100, fill: 'var(--color-brand)', display: 'Current' },
  { label: 'ABS Trigger', value: -0.30, fill: '#CC0000', display: '−30 bps' },
  { label: 'Hedge Loss', value: -0.08, fill: '#CC0000', display: '−8 bps' },
  { label: 'Do Nothing', value: c.do_nothing_capital_ratio * 100, fill: '#94a3b8', display: 'Do Nothing' },
  { label: 'ABS Remediate', value: 0.22, fill: '#10b981', display: '+22 bps' },
  { label: 'Hedge Restructure', value: 0.06, fill: '#10b981', display: '+6 bps' },
  { label: 'Remediate', value: c.remediate_capital_ratio * 100, fill: 'var(--color-brand)', display: 'Remediate' },
];

const usdB = (n) => `$${(n / 1e9).toFixed(2)}B`;

export default function CapitalWaterfall() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <p className="text-xs font-semibold text-text-muted mb-3">
        Regulatory Capital Ratio — Scenario Waterfall
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#999' }} axisLine={false} tickLine={false} interval={0} />
          <YAxis
            tick={{ fontSize: 10, fill: '#999' }}
            axisLine={false}
            tickLine={false}
            domain={[6.5, 11]}
            tickFormatter={(v) => `${v.toFixed(1)}%`}
          />
          <Tooltip
            formatter={(value, _name, ctx) => [ctx.payload.display || `${value}%`, ctx.payload.label]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #eee' }}
          />
          <ReferenceLine
            y={c.well_capitalized_threshold * 100}
            stroke="#10b981"
            strokeDasharray="4 4"
            label={{ value: 'Well-Capitalized (7.0%)', fill: '#10b981', fontSize: 9, position: 'right' }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} animationDuration={900}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Current Buffer</p>
          <p className="text-[12px] font-bold text-blue-700">{usdB(c.current_buffer_usd)}</p>
        </div>
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Do Nothing</p>
          <p className="text-[12px] font-bold text-red-600">{usdB(c.do_nothing_buffer_usd)}</p>
          <p className="text-[9px] text-text-subtle">−{c.do_nothing_buffer_reduction_bps} bps</p>
        </div>
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Remediate</p>
          <p className="text-[12px] font-bold text-emerald-700">{(c.remediate_capital_ratio * 100).toFixed(2)}%</p>
          <p className="text-[9px] text-text-subtle">−{c.remediate_buffer_reduction_bps} bps</p>
        </div>
      </div>
    </div>
  );
}
