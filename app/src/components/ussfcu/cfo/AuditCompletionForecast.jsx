import { motion } from 'framer-motion';
import { Clock, Timer, ShieldCheck } from 'lucide-react';
import recon from '../../../data/ussfcu/cfo/reconciliation.json';

const f = recon.forecast;

function TimelineBar({ label, days, max, tone, sub }) {
  const pct = Math.round((days / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium text-text-muted">{label}</span>
        <span className={`text-[11px] font-bold ${tone === 'governed' ? 'text-emerald-600' : 'text-text-muted'}`}>{days} days</span>
      </div>
      <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${tone === 'governed' ? 'bg-emerald-500' : 'bg-brand'}`}
        />
      </div>
      {sub ? <p className="text-[9px] text-text-subtle mt-0.5">{sub}</p> : null}
    </div>
  );
}

export default function AuditCompletionForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">{f.title}</p>
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
          −{f.reduction_pct}% close time
        </span>
      </div>

      <div className="space-y-3">
        <TimelineBar label="Manual reconstruction (today)" days={f.manual_days} max={f.manual_days} tone="manual" sub="Reconstructing lineage by hand on every auditor request" />
        <TimelineBar label="Governed lineage" days={f.governed_days} max={f.manual_days} tone="governed" sub="Every reported figure traceable to source on demand" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <Clock className="w-3.5 h-3.5 text-amber-500 mb-1" />
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Recon hours / mo</p>
          <p className="text-[12px] font-bold text-text">{f.recon_hours_before} → <span className="text-emerald-600">{f.recon_hours_after}</span></p>
          <p className="text-[9px] text-text-subtle">−{f.recon_hours_reduction_pct}%</p>
        </div>
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <Timer className="w-3.5 h-3.5 text-brand mb-1" />
          <p className="text-[9px] uppercase text-text-subtle font-semibold">Audit close</p>
          <p className="text-[12px] font-bold text-text">{f.manual_days} → <span className="text-emerald-600">{f.governed_days} d</span></p>
          <p className="text-[9px] text-text-subtle">−{f.reduction_pct}%</p>
        </div>
        <div className="bg-surface rounded-lg p-2 border border-border-subtle">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mb-1" />
          <p className="text-[9px] uppercase text-text-subtle font-semibold">5300 traceability</p>
          <p className="text-[12px] font-bold text-text">{f.traceability_before_pct}% → <span className="text-emerald-600">{f.traceability_after_pct}%</span></p>
          <p className="text-[9px] text-text-subtle">examination-ready</p>
        </div>
      </div>
    </motion.div>
  );
}
