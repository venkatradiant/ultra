import churnData from '../../data/retention/churn_model.json';

const segments = churnData.by_segment.sort((a, b) => b.avg_probability - a.avg_probability);

export default function RetentionRiskTable() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Retention Risk Segments</h3>
      <p className="text-[11px] text-text-subtle mb-3">Ranked by churn probability — Einstein Churn Predictor v3.2</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 pr-2 font-semibold text-text-muted">#</th>
              <th className="text-left py-2 pr-2 font-semibold text-text-muted">Segment</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Churn Risk</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Members</th>
              <th className="text-right py-2 pl-2 font-semibold text-text-muted">LTV at Risk</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((seg, idx) => (
              <tr key={seg.segment} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-2 text-text-subtle font-medium">{idx + 1}</td>
                <td className="py-2 pr-2">
                  <div className="font-medium text-text">{seg.segment}</div>
                  <div className="text-[10px] text-text-subtle mt-0.5">{seg.primary_driver}</div>
                </td>
                <td className="text-right py-2 px-2">
                  <span className={`font-bold ${seg.avg_probability >= 0.65 ? 'text-red-600' : seg.avg_probability >= 0.55 ? 'text-amber-600' : 'text-text-muted'}`}>
                    {(seg.avg_probability * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="text-right py-2 px-2 text-text-muted font-medium">{seg.count.toLocaleString()}</td>
                <td className="text-right py-2 pl-2 font-semibold text-text">{seg.ltv_at_risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-2 border-t border-border-subtle flex justify-between text-[10px] text-text-subtle">
        <span>Total at risk: {churnData.summary.total_at_risk.toLocaleString()} members</span>
        <span>Total LTV: {churnData.summary.total_ltv_at_risk}</span>
      </div>
    </div>
  );
}
