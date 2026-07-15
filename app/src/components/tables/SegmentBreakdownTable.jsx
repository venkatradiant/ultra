import chatFlows from '../../data/chatFlows.json';
import penfedChatFlows from '../../data/penfed/chatFlows.json';
import { useBranding } from '../../context/BrandingContext';

export default function SegmentBreakdownTable() {
  const { clientId } = useBranding();
  const flows = clientId === 'penfed' ? penfedChatFlows : chatFlows;
  const tableData = flows.turn_2_segmentation.ui_components_to_render[0];
  return (
    <div className="bg-surface rounded-xl border border-border-subtle p-5">
      <h3 className="text-sm font-semibold text-text mb-1">{tableData.title}</h3>
      <p className="text-xs text-text-subtle mb-4">First-time mortgage applicants stalled at Step 4</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Age Band</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Channel</th>
              <th className="text-left py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Tenure</th>
              <th className="text-right py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Count</th>
              <th className="text-right py-2.5 px-3 font-semibold text-text-muted uppercase tracking-wider text-[10px]">Churn Risk</th>
            </tr>
          </thead>
          <tbody>
            {tableData.data.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-3 text-text font-medium">{row.age_band}</td>
                <td className="py-3 px-3 text-text-muted">{row.channel}</td>
                <td className="py-3 px-3 text-text-muted">{row.product_tenure}</td>
                <td className="py-3 px-3 text-right font-semibold text-text">{row.count}</td>
                <td className="py-3 px-3 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    row.churn_risk_score >= 0.65 ? 'bg-red-50 text-red-600' :
                    row.churn_risk_score >= 0.6 ? 'bg-amber-50 text-amber-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {Math.round(row.churn_risk_score * 100)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] text-text-subtle">
        <span>Total affected: <span className="font-semibold text-text-muted">847 members</span></span>
        <span>61% existing members</span>
      </div>
    </div>
  );
}
