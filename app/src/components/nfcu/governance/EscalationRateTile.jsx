import { AlertTriangle } from 'lucide-react';

export default function EscalationRateTile({ escalation }) {
  const rate = escalation?.rate_pct_24h ?? 0;
  const target = escalation?.target_pct ?? 5;
  const events = escalation?.events_24h ?? 0;
  const overTarget = rate > target;
  const ringColor = overTarget ? '#DC2626' : '#16A34A';
  const pct = Math.max(0, Math.min(1, rate / 10)); // visualize against 10% ceiling

  const W = 92, H = 92, cx = W / 2, cy = H / 2, r = 36;
  const c = 2 * Math.PI * r;
  const dash = pct * c;

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-text-subtle" />
          <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Escalation Rate · 24h</div>
        </div>
        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${overTarget ? 'text-red-700 bg-red-50' : 'text-green-700 bg-green-50'}`}>
          {overTarget ? 'Over target' : 'Within target'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" style={{ width: W, height: H }}>
          <svg width={W} height={H} className="-rotate-90">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={7} />
            <circle
              cx={cx} cy={cy} r={r} fill="none" stroke={ringColor} strokeWidth={7}
              strokeDasharray={`${dash} ${c}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-text tabular-nums leading-none">{rate.toFixed(1)}%</span>
            <span className="text-[8px] text-text-subtle mt-0.5">target {target}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-medium text-text-muted">{events} auto-escalations</p>
          <p className="text-[10px] text-text-muted mt-0.5">in last 24 hours, all routed to a human reviewer</p>
        </div>
      </div>
    </div>
  );
}
