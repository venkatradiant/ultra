import { Check } from 'lucide-react';
import scenarios from '../../../data/penfed/capmarkets/scenarios.json';

const pct = (n) => `${(n * 100).toFixed(2)}%`;
const usd = (n) => {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
};

export default function ScenarioComparisonTable() {
  return (
    <div className="bg-surface-2 rounded-xl p-4 border border-border-subtle">
      <p className="text-xs font-semibold text-text-muted mb-3">
        Trigger Scenario Comparison — {scenarios.trust}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {scenarios.scenarios.map((s) => (
          <div
            key={s.id}
            className={`rounded-lg p-3 border ${
              s.recommended
                ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-200'
                : 'bg-surface border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-bold text-text">{s.label}</p>
              {s.recommended && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  <Check className="w-2.5 h-2.5" /> REC
                </span>
              )}
            </div>
            <dl className="space-y-1.5">
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-text-subtle font-semibold">Projected DQ</dt>
                <dd className={`text-[13px] font-bold ${s.projected_dq_rate >= scenarios.trigger_threshold ? 'text-red-600' : 'text-emerald-700'}`}>
                  {pct(s.projected_dq_rate)}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-text-subtle font-semibold">Trigger</dt>
                <dd className="text-[10.5px] text-text-muted">{s.trigger_status}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-text-subtle font-semibold">2025-B Impact</dt>
                <dd className="text-[10.5px] text-text-muted">{s.issuance_2025b_impact}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-text-subtle font-semibold">Cost</dt>
                <dd className="text-[10.5px] text-text-muted">{usd(s.estimated_cost_usd)}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-wider text-text-subtle font-semibold">Timeline</dt>
                <dd className="text-[10.5px] text-text-muted">
                  {s.timeline_weeks ? `${s.timeline_weeks} weeks` : '—'}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-text-subtle mt-3">
        Trigger threshold: {pct(scenarios.trigger_threshold)} sustained over 2 consecutive periods.
      </p>
    </div>
  );
}
