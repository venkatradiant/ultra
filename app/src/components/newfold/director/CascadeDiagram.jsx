import { Megaphone, AlertTriangle, ArrowRightLeft, ArrowDown } from 'lucide-react';
import metrics from '../../../data/newfold-digital/director/metrics.json';

const toneMeta = {
  trigger: { icon: Megaphone, ring: 'border-amber-200 bg-amber-500/[0.05]', dot: 'text-amber-600' },
  critical: { icon: AlertTriangle, ring: 'border-red-200 bg-red-500/[0.05]', dot: 'text-red-600' },
  action: { icon: ArrowRightLeft, ring: 'border-brand/30 bg-brand/[0.05]', dot: 'text-brand' },
};

export default function CascadeDiagram() {
  const chain = metrics.cascade;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Cascade — How the Renewal Spike Pulled Bluehost Down</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Marketing Cloud · Billing · Service Cloud · Workforce Management</p>
      </div>
      <div className="p-4">
        {chain.map((n, i) => {
          const m = toneMeta[n.tone] || toneMeta.critical;
          const Icon = m.icon;
          const last = i === chain.length - 1;
          return (
            <div key={i}>
              <div className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${m.ring}`}>
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${m.dot}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text leading-tight">{n.node}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 leading-snug">{n.detail}</p>
                </div>
              </div>
              {!last ? <div className="flex justify-center py-1"><ArrowDown className="w-3.5 h-3.5 text-text-subtle" /></div> : null}
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-red-500/[0.04]">
        <p className="text-[10px] text-red-600 font-semibold">→ A second brand went critical from a staffing decision, not a demand shock. Scenario C stabilizes renewals without draining Bluehost further.</p>
      </div>
    </div>
  );
}
