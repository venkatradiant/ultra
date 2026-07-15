import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useIntraday } from '../../context/IntradayContext';

// Rows are metrics; columns are plans. Mirrors the comparison a supervisor
// actually performs ("which plan gets me to the best SL?") instead of forcing
// them to scan three vertical narrative cards.
const ROWS = [
  { key: 'service_level', label: 'Service Level', format: (v) => `${v}%`,          tone: 'emerald' },
  { key: 'ahandle',       label: 'AHT',           format: (v) => v,                 tone: 'neutral' },
  { key: 'abandonment',   label: 'Abandonment',   format: (v) => `${v}%`,           tone: 'neutral' },
];

function getMetric(plan, key) {
  return plan?.projection?.[key];
}

export default function ScenarioComparisonCards({ scenarios = [] }) {
  const { selectedScenario, setSelectedScenario } = useIntraday();
  if (!scenarios.length) return null;

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Column headers */}
      <div
        className="grid border-b border-border-subtle"
        style={{ gridTemplateColumns: `100px repeat(${scenarios.length}, minmax(0, 1fr))` }}
      >
        <div className="px-2.5 py-2 bg-gray-50/70 text-[10px] font-semibold uppercase tracking-wide text-text-subtle">
          Metric
        </div>
        {scenarios.map((s) => {
          const isSelected = selectedScenario === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedScenario(isSelected ? null : s.id)}
              className={`px-2.5 py-2 text-left border-l border-border-subtle transition-colors cursor-pointer ${
                isSelected ? 'bg-brand/[0.06]' : 'bg-surface hover:bg-surface-2'
              }`}
              title={s.summary}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold ${
                  isSelected ? 'bg-brand text-white' : 'bg-surface-2 text-text-muted'
                }`}>
                  {s.id.replace('PLAN-', '')}
                </span>
                {isSelected ? <Check className="w-3 h-3 text-brand" /> : null}
              </div>
              <p className={`text-[10.5px] font-semibold leading-tight ${
                isSelected ? 'text-brand' : 'text-text-muted'
              }`}>
                {s.title}
              </p>
            </button>
          );
        })}
      </div>

      {/* Metric rows */}
      {ROWS.map((row) => (
        <div
          key={row.key}
          className="grid border-b border-gray-50 last:border-0"
          style={{ gridTemplateColumns: `100px repeat(${scenarios.length}, minmax(0, 1fr))` }}
        >
          <div className="px-2.5 py-1.5 bg-gray-50/40 text-[10.5px] font-medium text-text-muted flex items-center">
            {row.label}
          </div>
          {scenarios.map((s) => {
            const isSelected = selectedScenario === s.id;
            const value = getMetric(s, row.key);
            return (
              <motion.div
                key={s.id}
                layout
                className={`px-2.5 py-1.5 text-[12px] font-bold tabular-nums border-l border-border-subtle ${
                  isSelected
                    ? row.tone === 'emerald'
                      ? 'bg-brand/[0.06] text-emerald-700'
                      : 'bg-brand/[0.06] text-text'
                    : row.tone === 'emerald'
                    ? 'text-emerald-600'
                    : 'text-text-muted'
                }`}
              >
                {value != null ? row.format(value) : '—'}
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Cost + Time + Risk + Activate row */}
      <div
        className="grid bg-gray-50/40 border-t border-border-subtle"
        style={{ gridTemplateColumns: `100px repeat(${scenarios.length}, minmax(0, 1fr))` }}
      >
        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-subtle">
          Cost · ETA
        </div>
        {scenarios.map((s) => {
          const isSelected = selectedScenario === s.id;
          return (
            <div
              key={s.id}
              className={`px-2.5 py-1.5 border-l border-border-subtle ${
                isSelected ? 'bg-brand/[0.06]' : ''
              }`}
            >
              <p className="text-[10.5px] font-semibold text-text-muted tabular-nums">
                {s.costDelta} · {s.timeToImpact}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="grid border-t border-border-subtle"
        style={{ gridTemplateColumns: `100px repeat(${scenarios.length}, minmax(0, 1fr))` }}
      >
        <div className="px-2.5 py-1.5 bg-gray-50/40 text-[10px] font-semibold uppercase tracking-wide text-text-subtle">
          Risk
        </div>
        {scenarios.map((s) => {
          const isSelected = selectedScenario === s.id;
          return (
            <div
              key={s.id}
              className={`px-2.5 py-1.5 border-l border-border-subtle ${
                isSelected ? 'bg-brand/[0.06]' : ''
              }`}
            >
              <p className="text-[10px] text-text-muted leading-tight">{s.risk}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
