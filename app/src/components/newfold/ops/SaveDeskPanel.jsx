import metrics from '../../../data/newfold-digital/ops/metrics.json';

const churnColor = (c) => (c >= 85 ? 'text-red-600' : c >= 78 ? 'text-amber-600' : 'text-text-muted');

export default function SaveDeskPanel() {
  const s = metrics.saveDesk;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted">Save-Desk Load & High-Value At-Risk Accounts</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Source: Genesys Cloud · Billing · Customer 360 · Save-Offer Catalog</p>
        </div>
        <span className="text-[10px] font-semibold text-red-600 bg-red-500/10 rounded-full px-2 py-1">Abandoned {s.abandonedDelta}</span>
      </div>
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted uppercase tracking-wide font-semibold w-24 flex-shrink-0">Desk capacity</span>
          <div className="flex-1 bg-surface-2 rounded-full h-2.5 overflow-hidden relative">
            <div className="h-full rounded-full bg-red-400" style={{ width: `${Math.min(s.capacityPct, 100)}%` }} />
            <div className="absolute top-0 bottom-0 w-px bg-slate-500" style={{ left: '100%' }} />
          </div>
          <span className="text-sm font-bold text-red-600 tabular-nums w-12 text-right">{s.capacityPct}%</span>
        </div>
        <p className="text-[10px] text-text-subtle mt-1">Over 100% of planned capacity — save conversations averaging 12:40 vs 8:50 standard.</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Customer</th>
            <th className="text-center px-2 py-2 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Tenure</th>
            <th className="text-right px-2 py-2 font-semibold text-text-muted text-[10px] uppercase tracking-wider">LTV</th>
            <th className="text-center px-2 py-2 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Churn</th>
            <th className="text-left px-4 py-2 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Recommended Offer</th>
          </tr>
        </thead>
        <tbody>
          {s.atRisk.map((r) => (
            <tr key={r.customer} className="border-t border-border-subtle hover:bg-gray-50/60 transition-colors">
              <td className="px-4 py-2.5 font-semibold text-text">{r.customer}</td>
              <td className="px-2 py-2.5 text-center text-text-muted">{r.tenure}</td>
              <td className="px-2 py-2.5 text-right font-medium text-text tabular-nums">{r.ltv}</td>
              <td className={`px-2 py-2.5 text-center font-bold tabular-nums ${churnColor(r.churn)}`}>{r.churn}</td>
              <td className="px-4 py-2.5">
                <span className="text-[10px] font-medium bg-brand/10 text-brand rounded px-1.5 py-0.5">{r.offer}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-border-subtle">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Save-Rate Projection — Tailored vs Generic Offer</p>
        <div className="space-y-2">
          {s.saveRateProjection.map((p) => (
            <div key={p.approach} className="flex items-center gap-2">
              <span className="text-[11px] text-text w-28 flex-shrink-0">{p.approach}</span>
              <div className="flex-1 bg-surface-2 rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full ${p.approach.includes('Tailored') ? 'bg-emerald-400' : 'bg-slate-300'}`} style={{ width: `${p.saveRate}%` }} />
              </div>
              <span className={`text-[10px] font-bold tabular-nums w-8 text-right ${p.approach.includes('Tailored') ? 'text-emerald-600' : 'text-text-muted'}`}>{p.saveRate}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">→ 640 high-risk-high-value accounts in today's batch. A tailored first offer lifts save rate 9 points (41% → 50%).</p>
      </div>
    </div>
  );
}
