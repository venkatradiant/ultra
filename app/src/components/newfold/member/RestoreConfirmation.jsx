import { CheckCircle2, PartyPopper } from 'lucide-react';
import metrics from '../../../data/newfold-digital/member/metrics.json';

export default function RestoreConfirmation() {
  return (
    <div className="bg-surface rounded-xl border border-emerald-200 overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-500/[0.05] flex items-center gap-2">
        <PartyPopper className="w-4 h-4 text-emerald-600" />
        <p className="text-xs font-bold text-emerald-700">You're all set — no reactivation fee</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {metrics.restoreSteps.map((s, i) => (
          <div key={i} className="px-4 py-2.5 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-[11px] text-text flex-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-border-subtle bg-surface-2 flex items-center justify-between">
        <span className="text-[11px] text-text-muted">Renewal <span className="line-through">{metrics.renewalAmount}</span></span>
        <span className="text-sm font-bold text-emerald-600">{metrics.netAmount} <span className="text-[10px] font-medium text-text-muted">(saved {metrics.savings})</span></span>
      </div>
    </div>
  );
}
