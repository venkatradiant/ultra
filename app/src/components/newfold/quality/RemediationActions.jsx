import { RotateCcw, Mail, Phone } from 'lucide-react';
import metrics from '../../../data/newfold-digital/quality/metrics.json';

const kindMeta = {
  macro: { icon: RotateCcw, color: 'text-brand', bg: 'bg-brand/10' },
  auto: { icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  callback: { icon: Phone, color: 'text-amber-600', bg: 'bg-amber-500/10' },
};

export default function RemediationActions() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-lg">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Recommended Remediation</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Macro Management · Customer 360 · Compliance Engine</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {metrics.remediation.map((a, i) => {
          const m = kindMeta[a.kind] || kindMeta.auto;
          const Icon = m.icon;
          return (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <span className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text">{a.title}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{a.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-border-subtle">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Compliance Posture — Current vs Post-Remediation</p>
        <div className="space-y-2">
          {[{ label: 'Current', v: metrics.posture.current, tone: 'red' }, { label: 'Post-remediation', v: metrics.posture.postRemediation, tone: 'emerald' }].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="text-[11px] text-text w-28 flex-shrink-0">{row.label}</span>
              <div className="flex-1 bg-surface-2 rounded-full h-3 overflow-hidden">
                <div className={`h-full rounded-full ${row.tone === 'red' ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${row.v}%` }} />
              </div>
              <span className={`text-[10px] font-bold tabular-nums w-8 text-right ${row.tone === 'red' ? 'text-red-600' : 'text-emerald-600'}`}>{row.v}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">→ Revert eliminates the risk for everyone; 297 auto-resolve by email, 21 need a callback. Posture moves 79% → 96%. Compliance incident summary ready to draft.</p>
      </div>
    </div>
  );
}
