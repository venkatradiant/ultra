import { CreditCard, Mail, EyeOff, Plus, Equal } from 'lucide-react';

export default function DunningExplainer() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Why You Never Saw the Warning</p>
      </div>
      <div className="p-4 flex items-center justify-center gap-2 flex-wrap">
        <div className="text-center rounded-lg border border-border-subtle bg-surface-2 px-3 py-2.5 w-28">
          <CreditCard className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-[10px] font-semibold text-text">Card expired</p>
          <p className="text-[9px] text-text-subtle mt-0.5">Last month</p>
        </div>
        <Plus className="w-3.5 h-3.5 text-text-subtle" />
        <div className="text-center rounded-lg border border-border-subtle bg-surface-2 px-3 py-2.5 w-28">
          <Mail className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-[10px] font-semibold text-text">4 notices sent</p>
          <p className="text-[9px] text-text-subtle mt-0.5">To an outdated billing email</p>
        </div>
        <Equal className="w-3.5 h-3.5 text-text-subtle" />
        <div className="text-center rounded-lg border border-red-200 bg-red-500/[0.05] px-3 py-2.5 w-28">
          <EyeOff className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-[10px] font-semibold text-red-600">You never saw it</p>
          <p className="text-[9px] text-text-subtle mt-0.5">Not your fault</p>
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-brand/[0.04]">
        <p className="text-[10px] text-brand font-semibold">→ The billing address was never updated after you changed your main email. I can fix both while we're here.</p>
      </div>
    </div>
  );
}
