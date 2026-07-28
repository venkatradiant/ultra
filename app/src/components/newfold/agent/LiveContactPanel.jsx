import { User, Frown, Clock, Sparkles } from 'lucide-react';
import metrics from '../../../data/newfold-digital/agent/metrics.json';

export default function LiveContactPanel() {
  const c = metrics.contact;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle bg-brand/[0.04] flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-brand" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-text">{c.customer}</p>
            <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-500/10 rounded px-1.5 py-0.5">Live</span>
          </div>
          <p className="text-[11px] text-text-muted">{c.reason} · {c.tenure}</p>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <Frown className="w-4 h-4 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide text-text-muted font-semibold">Sentiment</p>
          <p className="text-xs font-semibold text-red-600">{c.sentiment}</p>
        </div>
        <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-red-400 rounded-full" style={{ width: '78%' }} />
        </div>
      </div>
      <div className="px-4 py-3 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] uppercase tracking-wide text-brand font-semibold">Recommended action</p>
          <p className="text-xs font-semibold text-text mt-0.5">{c.recommended}</p>
          <p className="text-[10px] text-text-muted mt-0.5">Lead with a clear explanation — avoid transfers, resolve in one contact.</p>
        </div>
      </div>
    </div>
  );
}
