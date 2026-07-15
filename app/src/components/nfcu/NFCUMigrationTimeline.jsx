import metrics from '../../data/nfcu/director/director_metrics.json';

const statusConfig = {
  complete: { bar: 'bg-emerald-400', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Complete' },
  at_risk: { bar: 'bg-red-400', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200', label: 'At Risk' },
  not_started: { bar: 'bg-gray-300', dot: 'bg-gray-400', badge: 'bg-surface-2 text-text-muted border-border', label: 'Not Started' },
};

const formatRange = (start, end) => {
  const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
};

export default function NFCUMigrationTimeline() {
  const phases = metrics.migration_phases;
  const failures = metrics.ivr_parity_failures;
  const totalAtRiskVolume = failures.reduce((s, f) => s + f.volume_pct, 0);

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted">Genesys → Dynamics 365 Migration — Phase Timeline</p>
          <p className="text-[10px] text-text-subtle mt-0.5">Source: Migration PMO Tracker · Genesys Cloud · Dynamics 365 Routing</p>
        </div>
        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
          Phase 2 — 12 days behind
        </span>
      </div>

      <div className="p-4 space-y-3">
        {phases.map((p) => {
          const s = statusConfig[p.status];
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-[11px] font-semibold text-text-muted">{p.name}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold border ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
                <span className="text-[10px] text-text-subtle font-medium">{formatRange(p.start, p.end)}</span>
              </div>
              <div className="bg-surface-2 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${p.progress}%` }} />
              </div>
              <p className="text-[10px] text-text-muted mt-1">{p.note}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border-subtle bg-gray-50/60 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-text-muted">3 IVR Flows Failing Parity</p>
          <span className="text-[10px] text-red-600 font-bold">{totalAtRiskVolume}% of call volume</span>
        </div>
        <div className="space-y-1.5">
          {failures.map((f) => (
            <div key={f.flow} className="flex items-center justify-between text-[10px]">
              <span className="text-text-muted font-medium">{f.flow}</span>
              <span className="text-text-muted">
                <span className="font-bold text-text-muted">{f.volume_pct}%</span> · {f.failure_reason}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">
          → Hard deadline May 15. Slip past it compresses Phase 3 (12 → 8 weeks) and risks ~$110K downstream exposure.
        </p>
      </div>
    </div>
  );
}
