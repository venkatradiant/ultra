import chatFlows from '../../data/chatFlows.json';
import penfedChatFlows from '../../data/penfed/chatFlows.json';
import { useBranding } from '../../context/BrandingContext';

export default function AnomalyResultsTable() {
  const { clientId } = useBranding();
  const flows = clientId === 'penfed' ? penfedChatFlows : chatFlows;
  const tableData = flows.turn_5_anomaly_detection.ui_components_to_render[0];
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-1">{tableData.title}</h3>
      <p className="text-xs text-text-subtle mb-4">Predictive AI + Agentic Data Platform</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Source</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Anomaly</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Risk</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Status</th>
              <th className="text-right py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Members</th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3 text-[11px]">
                  <span className="font-semibold text-brand">{row.source}</span>
                </td>
                <td className="py-3 px-3 text-text-muted text-[11px] max-w-[200px]">{row.anomaly}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    row.risk_score >= 90 ? 'bg-red-50 text-red-600' :
                    row.risk_score >= 75 ? 'bg-amber-50 text-amber-600' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {row.risk_score}
                  </span>
                </td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    row.status.includes('Escalated') || row.status.includes('SAR') ? 'bg-red-50 text-red-700' :
                    row.status.includes('investigation') ? 'bg-amber-50 text-amber-700' :
                    row.status.includes('JIRA') ? 'bg-blue-50 text-blue-700' :
                    'bg-surface-2 text-text-muted'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-3 px-2 text-right font-semibold text-text">{row.members_affected.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] text-text-subtle">Live monitoring active across all connected systems</span>
      </div>
    </div>
  );
}
