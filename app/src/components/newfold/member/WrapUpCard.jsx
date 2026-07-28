import { CheckCircle2, RefreshCw, Globe, ShoppingCart, Mail } from 'lucide-react';

export default function WrapUpCard() {
  return (
    <div className="bg-surface rounded-xl border border-emerald-200 overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-500/[0.05] flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <p className="text-xs font-bold text-emerald-700">Resolved</p>
      </div>
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Back Online</p>
        <div className="flex gap-2">
          {[{ icon: Globe, label: 'Website' }, { icon: ShoppingCart, label: 'Store' }, { icon: Mail, label: 'Email' }].map((x) => (
            <span key={x.label} className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-500/[0.08] rounded px-2 py-1">
              <x.icon className="w-3 h-3" /> {x.label}
              <CheckCircle2 className="w-2.5 h-2.5" />
            </span>
          ))}
        </div>
        <p className="text-[10px] text-text-subtle mt-2">Live confirmation: your store is taking orders again. Data and past orders intact.</p>
      </div>
      <div className="px-4 py-3 flex items-start gap-2">
        <RefreshCw className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[11px] font-semibold text-text">Next renewal is handled</p>
          <p className="text-[10px] text-text-muted mt-0.5">Auto-renew is on with a valid card and your billing email is corrected — next year processes on its own and you'll see the reminders.</p>
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-surface-2">
        <button className="text-[11px] font-semibold text-brand hover:underline">View full account activity →</button>
      </div>
    </div>
  );
}
