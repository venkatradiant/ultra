import anomalyData from '../../data/risk/transaction_anomalies.json';

const anomalies = anomalyData.anomalies.sort((a, b) => b.risk_score - a.risk_score);

const STATUS_STYLES = {
  'SAR filed': 'bg-red-50 text-red-700',
  'Under investigation': 'bg-amber-50 text-amber-700',
  'SAR pending': 'bg-orange-50 text-orange-700',
  'Monitoring': 'bg-blue-50 text-blue-700',
};

function RiskBadge({ score }) {
  const color = score >= 85 ? 'text-red-600' : score >= 70 ? 'text-amber-600' : 'text-text-muted';
  return <span className={`font-bold ${color}`}>{score}</span>;
}

export default function TransactionAnomalyDetailTable() {
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h3 className="text-sm font-bold text-text mb-1">Transaction Anomalies — Overnight Scan</h3>
      <p className="text-[11px] text-text-subtle mb-3">
        {anomalyData.summary.total_anomalies} anomalies | {anomalyData.summary.total_accounts_involved} accounts | {anomalyData.summary.total_suspicious_amount} suspicious
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2 pr-2 font-semibold text-text-muted">Pattern</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Risk</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Accts</th>
              <th className="text-right py-2 px-2 font-semibold text-text-muted">Amount</th>
              <th className="text-left py-2 pl-2 font-semibold text-text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2 pr-2">
                  <div className="font-medium text-text">{a.pattern}</div>
                  <div className="text-[10px] text-text-subtle mt-0.5">{a.detection_source}</div>
                </td>
                <td className="text-right py-2 px-2">
                  <RiskBadge score={a.risk_score} />
                </td>
                <td className="text-right py-2 px-2 text-text-muted font-medium">{a.accounts_involved}</td>
                <td className="text-right py-2 px-2 text-text font-semibold">{a.total_amount}</td>
                <td className="py-2 pl-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[a.status] || 'bg-surface-2 text-text-muted'}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-2 border-t border-border-subtle flex justify-between text-[10px] text-text-subtle">
        <span>SARs filed: {anomalyData.summary.sars_filed} | Pending: {anomalyData.summary.sars_pending}</span>
        <span>Scan: {new Date(anomalyData.summary.scan_timestamp).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
