import chatFlows from '../../data/chatFlows.json';
import penfedChatFlows from '../../data/penfed/chatFlows.json';
import { useBranding } from '../../context/BrandingContext';

export default function ChurnRiskTable() {
  const { clientId } = useBranding();
  const flows = clientId === 'penfed' ? penfedChatFlows : chatFlows;
  const tableData = flows.turn_3_predictive.ui_components_to_render[0];
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-1">{tableData.title}</h3>
      <p className="text-xs text-text-subtle mb-4">Einstein churn model + behavioral signals</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px] w-8">#</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Segment</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Risk</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Driver</th>
              <th className="text-right py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Size</th>
              <th className="text-center py-2.5 px-2 font-semibold text-text-muted uppercase tracking-wider text-[10px]">LTV</th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-2 text-center">
                  <span className="w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold inline-flex items-center justify-center">
                    {row.rank}
                  </span>
                </td>
                <td className="py-3 px-3 text-text font-medium text-[11px]">{row.segment}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    parseInt(row.churn_risk) >= 70 ? 'bg-red-50 text-red-600' :
                    parseInt(row.churn_risk) >= 60 ? 'bg-amber-50 text-amber-600' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {row.churn_risk}
                  </span>
                </td>
                <td className="py-3 px-3 text-text-muted text-[11px]">{row.driver}</td>
                <td className="py-3 px-2 text-right font-semibold text-text">{row.size.toLocaleString()}</td>
                <td className="py-3 px-2 text-center">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    row.lifetime_value_index === 'Very High' ? 'bg-emerald-50 text-emerald-700' :
                    row.lifetime_value_index === 'Moderate' ? 'bg-blue-50 text-blue-700' :
                    'bg-surface-2 text-text-muted'
                  }`}>
                    {row.lifetime_value_index}
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
