import { GitMerge } from 'lucide-react';
import metrics from '../../../data/newfold-digital/agent/metrics.json';

export default function RootCauseCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <GitMerge className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text">Root Cause — Correlated Across 5 Systems</p>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] text-text-muted leading-relaxed">
          $203.88 annual renewal drew Nov 24 → card on file expired → payment declined → 4 dunning notices to an outdated billing email (never seen) → 15-day grace lapsed → hosting auto-suspended → site, store, and email offline together.
        </p>
      </div>
      <div className="px-4 py-3 border-t border-border-subtle bg-surface-2">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">One answer, five sources</p>
        <div className="flex flex-wrap gap-1.5">
          {metrics.rootCauseSources.map((s) => (
            <span key={s} className="text-[10px] font-medium text-brand bg-brand/10 rounded px-2 py-1">{s}</span>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">→ All five point to the same fix: update card, correct billing email, process renewal, lift suspension, restore email.</p>
      </div>
    </div>
  );
}
