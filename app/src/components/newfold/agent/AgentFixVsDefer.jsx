import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AgentFixVsDefer() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
      <div className="rounded-xl border border-emerald-200 bg-emerald-500/[0.05] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-bold text-emerald-700">Fix now</p>
        </div>
        <ul className="space-y-1.5 text-[11px] text-text">
          <li>• Restored in ~15 min, inside the window</li>
          <li>• No reactivation fee</li>
          <li>• Loyalty credit → $178.88 (save gesture)</li>
          <li>• First-contact resolution ✓</li>
        </ul>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-500/[0.04] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-bold text-red-600">Defer to customer</p>
        </div>
        <ul className="space-y-1.5 text-[11px] text-text-muted">
          <li>• Extended downtime, lost orders</li>
          <li>• Repeat contact likely</li>
          <li>• High churn risk (6-yr, store-dependent)</li>
          <li>• One-star review risk within 48h</li>
        </ul>
      </div>
    </div>
  );
}
