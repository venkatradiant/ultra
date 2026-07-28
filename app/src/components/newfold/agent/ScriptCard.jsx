import { Quote, Ban } from 'lucide-react';
import metrics from '../../../data/newfold-digital/agent/metrics.json';

export default function ScriptCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
        <Quote className="w-4 h-4 text-brand" />
        <p className="text-xs font-semibold text-text">Plain-Language Script</p>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] text-text italic leading-relaxed border-l-2 border-brand/40 pl-3">
          "Grace, your site is down because your yearly hosting renewal didn't go through — the card on file had expired, and our reminders were going to an old email address, so you never saw them. It's a quick fix on my end. Once I update your card and turn your hosting back on, your site, store, and email all come back in a few minutes, with no reactivation fee."
        </p>
      </div>
      <div className="px-4 py-3 border-t border-border-subtle bg-surface-2">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Avoid this jargon</p>
        <div className="flex flex-wrap gap-1.5">
          {metrics.jargonFlags.map((j) => (
            <span key={j} className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-500/[0.06] rounded px-2 py-1">
              <Ban className="w-2.5 h-2.5" /> {j}
            </span>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">→ Plain-language explanations resolve in one contact 40% more often.</p>
      </div>
    </div>
  );
}
