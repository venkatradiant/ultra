/**
 * MicroAgentTable — the five charge-type agents working this cycle.
 *
 * A different fleet from the admin's four pipeline agents, deliberately kept
 * separate (spec §17): these are cut by *what* they inspect, the admin's by
 * *what they do*. Collapsing them into one model would lose the fact that Tax
 * runs the lowest confidence of the five at 79% — which is the operator-side
 * evidence for the admin-side decision to weight the next retrain toward
 * tax-rule detection.
 */
import { Activity } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const STATUS_STYLE = {
  healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function MicroAgentTable({ agents = [] }) {
  if (!agents.length) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-text tracking-tight">
          <Activity className="w-4 h-4 text-brand" /> Micro-Agent Performance
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] text-text-subtle">All agents active · current cycle</span>
          <IllustrativeChip />
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Agent', 'Coverage', 'Accuracy', 'Avg Confidence', 'Processing Time', 'Status'].map((h, i) => (
                <th
                  key={h}
                  className={`py-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-subtle ${
                    i === 0 ? 'text-left' : i === 5 ? 'text-right' : 'text-center'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-b border-border-subtle last:border-0 hover:bg-surface-2/40 transition-colors">
                <td className="py-2.5 px-3 text-[12px] font-medium text-text">{a.agent}</td>
                <td className="py-2.5 px-3 text-[11.5px] text-text-muted text-center tabular-nums">{a.coverage}</td>
                <td className="py-2.5 px-3 text-[11.5px] font-semibold text-text text-center tabular-nums">{a.accuracy}</td>
                <td className="py-2.5 px-3 text-[11.5px] text-text-muted text-center tabular-nums">{a.avgConfidence}</td>
                <td className="py-2.5 px-3 text-[11.5px] text-text-muted text-center tabular-nums">{a.processingTime}</td>
                <td className="py-2.5 px-3 text-right">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLE[a.status] || ''}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10.5px] text-text-subtle mt-3 leading-relaxed">
        The Tax agent runs 89.5% accuracy at 79% average confidence — the weakest of the five, and the
        reason Tax Rule Change is the second-largest root cause this cycle.
      </p>
    </div>
  );
}
