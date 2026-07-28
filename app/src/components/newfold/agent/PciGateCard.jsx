import { ShieldAlert, Square } from 'lucide-react';
import metrics from '../../../data/newfold-digital/agent/metrics.json';

export default function PciGateCard() {
  return (
    <div className="bg-surface rounded-xl border border-amber-200 overflow-hidden max-w-md">
      <div className="px-4 py-2.5 bg-amber-500/[0.08] border-b border-amber-100 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        <p className="text-xs font-bold text-amber-700">Required before payment changes (PCI)</p>
      </div>
      <div className="px-4 py-3">
        <p className="text-[11px] text-text-muted mb-3">Confirm two identity elements with Grace, then check them off to unlock the payment update:</p>
        <div className="space-y-2">
          {metrics.identityElements.map((e, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2">
              <Square className="w-4 h-4 text-text-subtle flex-shrink-0" />
              <span className="text-xs text-text">{e.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-surface-2">
        <p className="text-[10px] text-text-muted">Completion is recorded as verified-by-agent — ties to the process-adherence signal the quality team tracks.</p>
      </div>
    </div>
  );
}
