import { Activity, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const statusStyles = {
  stable: { color: '#16A34A', label: 'Stable', bg: 'bg-green-50', text: 'text-green-700' },
  watch: { color: '#D97706', label: 'Watch', bg: 'bg-amber-50', text: 'text-amber-700' },
  warning: { color: '#D97706', label: 'Warning', bg: 'bg-amber-50', text: 'text-amber-700' },
  critical: { color: '#DC2626', label: 'Critical', bg: 'bg-red-50', text: 'text-red-700' },
};

export default function DriftIndicatorCard({ drift }) {
  const status = statusStyles[drift?.status] || statusStyles.stable;
  const score = drift?.score ?? 0;
  const delta = drift?.delta_7d ?? 0;
  const Trend = delta > 0.005 ? ArrowUpRight : delta < -0.005 ? ArrowDownRight : Minus;
  const trendColor = delta > 0.005 ? 'text-red-600' : delta < -0.005 ? 'text-green-600' : 'text-text-subtle';

  // 0–1 score → arc fill 0..180deg
  const pct = Math.max(0, Math.min(1, score));
  const W = 110, H = 60, cx = W / 2, cy = H, r = 44;
  const endAngle = Math.PI - pct * Math.PI;
  const x1 = cx - r, y1 = cy;
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-text-subtle" />
          <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Drift Score</div>
        </div>
        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${status.text} ${status.bg}`}>
          {status.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text tabular-nums">{score.toFixed(2)}</span>
            <span className={`inline-flex items-center text-[11px] font-semibold ${trendColor}`}>
              <Trend className="w-3 h-3 mr-0.5" />
              {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-text-muted mt-1 leading-snug">vs. <span className="font-medium">{drift?.baseline}</span></p>
        </div>

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="flex-shrink-0">
          <path d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#E5E7EB" strokeWidth={6} strokeLinecap="round" />
          {pct > 0 && (
            <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${x2} ${y2}`} fill="none" stroke={status.color} strokeWidth={6} strokeLinecap="round" />
          )}
        </svg>
      </div>

      {drift?.note && (
        <p className="text-[10px] text-text-muted mt-2 leading-relaxed">{drift.note}</p>
      )}
    </div>
  );
}
