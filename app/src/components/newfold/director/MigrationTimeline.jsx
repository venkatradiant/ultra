import { CheckCircle2, AlertTriangle, Clock, Circle } from 'lucide-react';
import metrics from '../../../data/newfold-digital/director/metrics.json';

const statusMeta = {
  complete: { icon: CheckCircle2, color: 'text-emerald-500', bar: 'bg-emerald-400' },
  behind: { icon: AlertTriangle, color: 'text-red-500', bar: 'bg-red-400' },
  at_risk: { icon: AlertTriangle, color: 'text-amber-500', bar: 'bg-amber-400' },
  pending: { icon: Circle, color: 'text-slate-300', bar: 'bg-slate-300' },
};

export default function MigrationTimeline() {
  const phases = metrics.migrationPhases;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted">Network Solutions Consolidation — Cutover Timeline</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Source: Migration PMO · SI Partner status reports</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-600 bg-red-500/10 rounded-full px-2 py-1">
          <Clock className="w-3 h-3" /> {metrics.licenseWindow}
        </span>
      </div>
      <div className="p-4 space-y-3">
        {phases.map((p) => {
          const m = statusMeta[p.status] || statusMeta.pending;
          const Icon = m.icon;
          return (
            <div key={p.phase} className="flex items-start gap-3">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${m.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text">{p.phase}</span>
                  <span className="text-[10px] tabular-nums text-text-muted">{p.progress}%</span>
                </div>
                <div className="mt-1 bg-surface-2 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${m.bar}`} style={{ width: `${p.progress}%` }} />
                </div>
                <p className={`text-[10px] mt-1 ${p.status === 'behind' || p.status === 'at_risk' ? 'text-red-600 font-medium' : 'text-text-subtle'}`}>{p.window}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-red-500/[0.04]">
        <p className="text-[10px] text-red-600 font-semibold">
          → 11 days behind. Miss the license window and agent migration compresses 12→8 weeks — high risk for handle time and quality.
        </p>
      </div>
    </div>
  );
}
