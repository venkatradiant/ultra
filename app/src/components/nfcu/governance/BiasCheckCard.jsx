import { Check, AlertTriangle, X, Scale } from 'lucide-react';

const statusConfig = {
  pass: { Icon: Check, color: 'text-green-700', bg: 'bg-green-50', label: 'Pass', dot: '#16A34A' },
  warn: { Icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50', label: 'Warn', dot: '#D97706' },
  fail: { Icon: X, color: 'text-red-700', bg: 'bg-red-50', label: 'Fail', dot: '#DC2626' },
};

export default function BiasCheckCard({ checks = [] }) {
  return (
    <div className="rounded-xl bg-surface border border-border-subtle p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <Scale className="w-3.5 h-3.5 text-text-subtle" />
        <div className="text-[9px] uppercase tracking-wider font-bold text-text-subtle">Bias Checks</div>
      </div>

      <ul className="space-y-2.5">
        {checks.map((check, i) => {
          const cfg = statusConfig[check.status] || statusConfig.pass;
          const Icon = cfg.Icon;
          return (
            <li key={i} className="flex items-start gap-2.5">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-text leading-snug">{check.dimension}</p>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${cfg.color} ${cfg.bg}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-muted">Δ {check.delta_pp >= 0 ? '+' : ''}{check.delta_pp?.toFixed?.(1) ?? check.delta_pp} pp</span>
                </div>
                {check.note && (
                  <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{check.note}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
