import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import metrics from '../../../data/newfold-digital/agent/metrics.json';

export default function AfterContactSummary() {
  const a = metrics.afterContact;
  const rows = [
    { label: 'Reason', value: a.reason },
    { label: 'Root cause', value: a.rootCause },
    { label: 'Resolution', value: a.resolution },
    { label: 'Compliance', value: a.compliance },
  ];
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <ClipboardCheck className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text">After-Contact Work — Auto-Drafted</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map((r) => (
          <div key={r.label} className="px-4 py-2.5">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">{r.label}</p>
            <p className="text-[11px] text-text mt-0.5 leading-snug">{r.value}</p>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-border-subtle bg-surface-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <CheckCircle2 className="w-3.5 h-3.5" /> First contact resolution: {a.fcr}
        </span>
        <span className="text-[11px] text-text-muted">Handle time: <span className="font-semibold text-text">{a.handleTime}</span></span>
      </div>
    </div>
  );
}
