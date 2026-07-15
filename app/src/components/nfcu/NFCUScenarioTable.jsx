const scenarios = [
  {
    label: 'Current Plan',
    serviceLevel: '62%',
    cost: '—',
    budget: '78%',
    notes: '22-agent gap unaddressed',
    highlight: false,
    status: 'fail',
  },
  {
    label: '15 OT Shifts',
    serviceLevel: '76%',
    cost: '$18,400',
    budget: '96%',
    notes: '4pts below target. Tight budget.',
    highlight: false,
    status: 'partial',
  },
  {
    label: '8 OT + Cross-Train ✓',
    serviceLevel: '79%',
    cost: '$11,200',
    budget: '85%',
    notes: 'Recommended — best cost/SL ratio',
    highlight: true,
    status: 'best',
  },
];

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

export default function NFCUScenarioTable() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Staffing Scenario Comparison — April 12–17 Tax Season</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Dynamics 365 WFM Forecasting + Budget System</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Scenario</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Service Level</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Cost</th>
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Q2 Budget</th>
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr
              key={s.label}
              className={`border-t border-border-subtle ${s.highlight ? 'bg-brand/[0.04]' : 'hover:bg-gray-50/60'} transition-colors`}
            >
              <td className="px-4 py-3">
                <span className={`font-semibold ${s.highlight ? 'text-brand' : 'text-text'}`}>{s.label}</span>
              </td>
              <td className={`px-3 py-3 text-center font-bold text-sm ${slColor(s.serviceLevel)}`}>{s.serviceLevel}</td>
              <td className="px-3 py-3 text-center font-medium text-text-muted">{s.cost}</td>
              <td className="px-4 py-3 min-w-[120px]">{budgetBar(s.budget)}</td>
              <td className="px-4 py-3 text-[10px] text-text-muted">{s.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">
          → Hybrid option saves $7,200 vs. 15 OT shifts with only 3% lower service level projection.
        </p>
      </div>
    </div>
  );
}
