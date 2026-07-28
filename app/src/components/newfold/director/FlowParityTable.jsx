import { XCircle } from 'lucide-react';
import metrics from '../../../data/newfold-digital/director/metrics.json';

export default function FlowParityTable() {
  const flows = metrics.flowParity;
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-xs font-semibold text-text-muted">Flow Parity Status — Legacy vs Unified Platform</p>
        <p className="text-[10px] text-text-subtle mt-0.5">Source: Legacy brand configuration · Unified-platform routing rules · Migration PMO</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-surface-2">
            <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Flow</th>
            <th className="text-left px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Legacy Macro Logic</th>
            <th className="text-left px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Unified Platform</th>
            <th className="text-center px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Parity</th>
          </tr>
        </thead>
        <tbody>
          {flows.map((f) => (
            <tr key={f.flow} className="border-t border-border-subtle bg-red-500/[0.03]">
              <td className="px-4 py-3 font-semibold text-text align-top">{f.flow}</td>
              <td className="px-3 py-3 text-text-muted align-top leading-snug">{f.legacy}</td>
              <td className="px-3 py-3 text-text-muted align-top leading-snug">{f.unified}</td>
              <td className="px-4 py-3 text-center align-top">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Failing
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border-subtle bg-red-500/[0.04]">
        <p className="text-[10px] text-red-600 font-semibold">
          → These 3 flows carry 34% of Network Solutions volume. Escalation requests a dated remediation plan within 48 hours.
        </p>
      </div>
    </div>
  );
}
