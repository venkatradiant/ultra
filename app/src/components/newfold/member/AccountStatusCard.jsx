import { Globe, Server, Mail, ShoppingCart, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import metrics from '../../../data/newfold-digital/member/metrics.json';

const iconFor = { Domain: Globe, 'Hosting Plan': Server, 'Business Email': Mail, 'Store (WooCommerce)': ShoppingCart };

export default function AccountStatusCard() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Account at a Glance</p>
      </div>
      <div className="divide-y divide-border-subtle">
        {metrics.accountStatus.map((s) => {
          const Icon = iconFor[s.label] || Globe;
          const down = s.status === 'down';
          return (
            <div key={s.label} className="px-4 py-3 flex items-center gap-3">
              <Icon className={`w-4 h-4 flex-shrink-0 ${down ? 'text-red-500' : 'text-emerald-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text">{s.label}</p>
                <p className="text-[10px] text-text-subtle">{s.detail}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${down ? 'text-red-600' : 'text-emerald-600'}`}>
                {down ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {s.value}
              </span>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-emerald-500/[0.06] flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <p className="text-[10px] text-emerald-700 font-medium">Direct lookup — no AI model used, no account detail left Newfold's systems.</p>
      </div>
    </div>
  );
}
