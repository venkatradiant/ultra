import { Mail, Send } from 'lucide-react';
import metrics from '../../../data/newfold-digital/director/metrics.json';

export default function MemoPreview() {
  const m = metrics.escalationMemo;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <Mail className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text">Draft Escalation Memo</p>
      </div>
      <div className="px-4 py-3 border-b border-border-subtle space-y-1">
        <p className="text-[11px]"><span className="text-text-muted">To:</span> <span className="text-text font-medium">{m.to}</span></p>
        <p className="text-[11px]"><span className="text-text-muted">Subject:</span> <span className="text-text font-semibold">{m.subject}</span></p>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] text-text-muted leading-relaxed mb-3">{m.body}</p>
        <div className="grid grid-cols-2 gap-2">
          {m.highlights.map((h) => (
            <div key={h.label} className="rounded-lg border border-border-subtle bg-surface-2 px-2.5 py-1.5">
              <p className="text-[9px] uppercase tracking-wide text-text-subtle font-semibold">{h.label}</p>
              <p className="text-[10.5px] text-text font-medium leading-tight mt-0.5">{h.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04] flex items-center gap-1.5">
        <Send className="w-3 h-3 text-brand" />
        <p className="text-[10px] text-brand font-semibold">Ready to send to your SI partner contact, or review and send yourself.</p>
      </div>
    </div>
  );
}
