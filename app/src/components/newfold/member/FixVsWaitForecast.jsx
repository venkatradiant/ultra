import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FixVsWaitForecast() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
      <div className="rounded-xl border border-emerald-200 bg-emerald-500/[0.05] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-bold text-emerald-700">Fix now</p>
        </div>
        <ul className="space-y-1.5 text-[11px] text-text">
          <li>• Site, store & email back in ~15 min</li>
          <li>• $203.88 → <span className="font-semibold">$178.88</span> with loyalty credit</li>
          <li>• No reactivation fee</li>
          <li>• Auto-renew on — won't repeat</li>
        </ul>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-500/[0.04] p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <p className="text-xs font-bold text-red-600">If you wait</p>
        </div>
        <ul className="space-y-1.5 text-[11px] text-text-muted">
          <li>• Site stays down — lost orders</li>
          <li>• Reactivation fee after 4 days</li>
          <li>• Loyalty credit window may close</li>
          <li>• Business email stays offline</li>
        </ul>
      </div>
    </div>
  );
}
