import { CreditCard, XCircle, PowerOff, ArrowDown, Globe, ShoppingCart, Mail } from 'lucide-react';
import metrics from '../../../data/newfold-digital/member/metrics.json';

const stepIcon = { card: CreditCard, x: XCircle, power: PowerOff };
const affectedIcon = { Website: Globe, 'Online store': ShoppingCart, 'Business email': Mail };

export default function FailureTrail() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden max-w-md">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">What Happened</p>
      </div>
      <div className="p-4">
        {metrics.failureTrail.map((s, i) => {
          const Icon = stepIcon[s.icon] || CreditCard;
          const last = i === metrics.failureTrail.length - 1;
          return (
            <div key={i}>
              <div className="flex items-start gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${last ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  <Icon className={`w-3.5 h-3.5 ${last ? 'text-red-500' : 'text-amber-500'}`} />
                </span>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-xs font-semibold text-text">{s.step}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-snug">{s.detail}</p>
                </div>
              </div>
              {!last ? <div className="pl-3.5 py-1"><ArrowDown className="w-3 h-3 text-text-subtle" /></div> : null}
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-border-subtle bg-surface-2">
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">What this affected</p>
        <div className="flex gap-2">
          {metrics.affected.map((a) => {
            const Icon = affectedIcon[a] || Globe;
            return (
              <span key={a} className="inline-flex items-center gap-1 text-[10px] text-red-600 bg-red-500/[0.06] rounded px-2 py-1">
                <Icon className="w-3 h-3" /> {a}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
