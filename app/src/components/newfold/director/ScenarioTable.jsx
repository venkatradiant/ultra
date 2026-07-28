import metrics from '../../../data/newfold-digital/director/metrics.json';

const slColor = (sl) => {
  const v = parseInt(sl);
  if (v >= 80) return 'text-emerald-600';
  if (v >= 75) return 'text-amber-600';
  return 'text-red-600';
};

const budgetBar = (pct) => {
  const v = parseInt(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-surface-2 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${v >= 95 ? 'bg-red-400' : v >= 85 ? 'bg-amber-400' : 'bg-emerald-400'}`}
          style={{ width: pct }}
        />
      </div>
      <span className={`text-[10px] font-bold ${v >= 95 ? 'text-red-600' : v >= 85 ? 'text-amber-600' : 'text-emerald-600'}`}>{pct}</span>
    </div>
  );
};

export default function ScenarioTable() {
  const scenarios = metrics.scenarios;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Cross-Brand Stabilization Scenarios — Today</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Service Cloud forecasting · Agent skill profiles · Billing deflection eligibility · Finance budget model</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Scenario</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Network Sol.</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Bluehost</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Aggregate</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Cost</th>
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Q4 Budget</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr key={s.label} className={`border-t border-border-subtle ${s.highlight ? 'bg-brand/[0.04]' : 'hover:bg-gray-50/60'} transition-colors`}>
              <td className="px-4 py-3">
                <div className={`font-semibold ${s.highlight ? 'text-brand' : 'text-text'}`}>
                  {s.label}
                  {s.highlight ? <span className="ml-2 text-[9px] font-bold uppercase tracking-wide bg-brand/10 text-brand rounded px-1.5 py-0.5">Recommended</span> : null}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">{s.notes}</div>
              </td>
              <td className={`px-3 py-3 text-center font-bold text-sm ${slColor(s.netsol_sl)}`}>{s.netsol_sl}</td>
              <td className={`px-3 py-3 text-center font-bold text-sm ${slColor(s.bluehost_sl)}`}>{s.bluehost_sl}</td>
              <td className={`px-3 py-3 text-center font-bold text-sm ${slColor(s.aggregate_sl)}`}>{s.aggregate_sl}</td>
              <td className="px-3 py-3 text-center font-medium text-text-muted">{s.cost}</td>
              <td className="px-4 py-3 min-w-[120px]">{budgetBar(s.budget_impact)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">
          → Scenario C delivers the highest aggregate service level (80%) at the lowest cost and protects the save desk — recommended.
        </p>
      </div>
    </div>
  );
}
