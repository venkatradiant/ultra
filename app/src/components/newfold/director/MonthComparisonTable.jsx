import metrics from '../../../data/newfold-digital/director/metrics.json';

function Sparkline({ points, positive }) {
  const w = 64;
  const h = 20;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = positive ? '#10b981' : '#ef4444';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={coords.join(' ')} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MonthComparisonTable() {
  const rows = metrics.monthCompare;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Month-over-Month Comparison — With 6-Month Trend</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Service Cloud (historical) · Billing · Finance · HR · Migration PMO</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Metric</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Last Month</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">This Month</th>
            <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Δ</th>
            <th className="text-center px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">6-mo Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.metric} className="border-t border-border-subtle hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-3 font-semibold text-text">{r.metric}</td>
              <td className="px-3 py-3 text-center text-text-muted tabular-nums">{r.last}</td>
              <td className="px-3 py-3 text-center font-bold text-text tabular-nums">{r.current}</td>
              <td className={`px-3 py-3 text-center font-semibold tabular-nums ${r.positive ? 'text-emerald-600' : 'text-red-600'}`}>{r.delta}</td>
              <td className="px-4 py-3">
                <div className="flex justify-center"><Sparkline points={r.spark} positive={r.positive} /></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">
          → With the care-notification rule and self-service billing explainer, cost per contact projects back under $9.00 and churn toward 2.5% within two cycles.
        </p>
      </div>
    </div>
  );
}
