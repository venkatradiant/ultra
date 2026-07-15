import riskSignals from '../../data/risk_signals.json';

const statusColors = {
  escalated: 'bg-red-50 text-red-600',
  under_review: 'bg-amber-50 text-amber-600',
  monitoring: 'bg-blue-50 text-blue-600',
};

const statusLabels = {
  escalated: 'Escalated',
  under_review: 'Under Review',
  monitoring: 'Monitoring',
};

export default function RiskSignalsTable() {
  const anomalies = riskSignals.transaction_anomalies.details.slice(0, 8);

  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text">Transaction Anomalies</h3>
          <p className="text-xs text-text-subtle mt-0.5">{riskSignals.transaction_anomalies.count} clusters detected this week</p>
        </div>
        <span className="px-2 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-semibold uppercase">
          {riskSignals.transaction_anomalies.severity}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">ID</th>
              <th className="text-left py-2 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Pattern</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Amount</th>
              <th className="text-center py-2 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Risk</th>
              <th className="text-center py-2 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.anomaly_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-2.5 px-2 text-text-subtle font-mono text-[10px]">{a.anomaly_id}</td>
                <td className="py-2.5 px-2 text-text font-medium text-[11px] max-w-[180px] truncate">{a.pattern}</td>
                <td className="py-2.5 px-2 text-right text-text-muted text-[11px]">{a.amount_range}</td>
                <td className="py-2.5 px-2 text-center">
                  <span className={`inline-block w-8 text-center px-1 py-0.5 rounded text-[10px] font-bold ${
                    a.risk_score >= 90 ? 'bg-red-100 text-red-700' :
                    a.risk_score >= 80 ? 'bg-orange-100 text-orange-700' :
                    a.risk_score >= 70 ? 'bg-amber-100 text-amber-700' :
                    'bg-surface-2 text-text-muted'
                  }`}>
                    {a.risk_score}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[a.status]}`}>
                    {statusLabels[a.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
