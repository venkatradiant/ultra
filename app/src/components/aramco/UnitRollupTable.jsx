/**
 * UnitRollupTable — safety exposure aggregated across every zone.
 *
 * The complex-manager altitude: the same live permit-and-location data the HSE
 * GM and the shift supervisors work from, rolled up per unit and ranked by
 * exposure rather than by size. Derived entirely from the shared site fixture —
 * there is no separate "management" dataset, which is the point.
 */
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getSiteData } from '../../data/aramco/hse-gm';
import IllustrativeDataChip, { ProvenanceLine } from './IllustrativeDataChip';
import MaximizablePanel, { MaximizeButton } from '../common/MaximizablePanel';

const HAZARD_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };
const HAZARD_TINT = {
  high: 'bg-rose-50 text-rose-800 border-rose-200',
  medium: 'bg-amber-50 text-amber-800 border-amber-200',
  low: 'bg-slate-50 text-slate-700 border-slate-200',
};

/**
 * Exposure score — deliberately simple and legible rather than clever: a unit's
 * high-risk permit load, weighted by how many people are standing in it, plus a
 * heavy penalty per job already outside its permit conditions. The GM should be
 * able to explain this ranking to an auditor in one sentence.
 */
function exposureScore(zone, flaggedCount) {
  return zone.highRiskPermits * 3 + Math.round(zone.people / 40) + flaggedCount * 25;
}

export default function UnitRollupTable({ getter = getSiteData }) {
  const site = useAsyncData(getter);
  if (!site) return null;

  const flaggedByZone = site.flaggedJobs.reduce((acc, j) => {
    acc[j.zoneId] = (acc[j.zoneId] || 0) + 1;
    return acc;
  }, {});

  const rows = site.zones
    .map((z) => {
      const flagged = flaggedByZone[z.id] || 0;
      return { ...z, flagged, score: exposureScore(z, flagged) };
    })
    .sort((a, b) => b.score - a.score);

  const maxScore = rows[0]?.score || 1;
  const totalPeople = rows.reduce((s, r) => s + r.people, 0);
  const totalHighRisk = rows.reduce((s, r) => s + r.highRiskPermits, 0);

  return (
    <MaximizablePanel className="p-4 sm:p-5" label="Unit roll-up">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text">Safety Exposure by Unit — Complex Roll-Up</h3>
          <ProvenanceLine
            className="mt-1"
            source="Permit-to-work system, Location and tag data (vendor-agnostic), Gate access-control"
            freshness={site.freshness}
            reconciled
            note="Aggregated from the same live data the HSE GM and shift supervisors work from — no separate management dataset."
          />
        </div>
        <span className="flex items-center gap-2"><IllustrativeDataChip /><MaximizeButton /></span>
      </div>

      <div className="overflow-x-auto scrollbar-sleek">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Unit</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Hazard</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle text-right">People</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle text-right">Permits</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle text-right">High-risk</th>
              <th className="pb-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-text-subtle text-right">Flagged</th>
              <th className="pb-2 text-[10px] font-bold uppercase tracking-wider text-text-subtle">Relative exposure</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: i * 0.035 }}
                className={`border-b border-border-subtle/60 last:border-0 ${r.flagged > 0 ? 'bg-rose-50/40' : ''}`}
              >
                <td className="py-2.5 pr-3 text-[12px] font-medium text-text align-middle whitespace-nowrap">
                  {r.name}
                </td>
                <td className="py-2.5 pr-3 align-middle">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[9.5px] font-semibold ${HAZARD_TINT[r.hazard]}`}
                  >
                    {HAZARD_LABEL[r.hazard]}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-[12px] text-text-muted align-middle text-right tabular-nums">
                  {r.people.toLocaleString()}
                </td>
                <td className="py-2.5 pr-3 text-[12px] text-text-muted align-middle text-right tabular-nums">
                  {r.permits}
                </td>
                <td className="py-2.5 pr-3 text-[12px] font-semibold text-text align-middle text-right tabular-nums">
                  {r.highRiskPermits}
                </td>
                <td className="py-2.5 pr-3 align-middle text-right">
                  {r.flagged > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-700">
                      <AlertTriangle className="w-3 h-3" /> {r.flagged}
                    </span>
                  ) : (
                    <span className="text-[12px] text-text-subtle">—</span>
                  )}
                </td>
                <td className="py-2.5 align-middle min-w-[120px]">
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((r.score / maxScore) * 100)}%` }}
                      transition={{ duration: 0.7, delay: 0.1 + i * 0.035, ease: 'easeOut' }}
                      className={`h-full rounded-full ${r.flagged > 0 ? 'bg-rose-600' : 'bg-brand/70'}`}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
        {totalPeople.toLocaleString()} people and {totalHighRisk} high-risk permits across {rows.length} zones. Exposure
        ranks high-risk permit load weighted by live occupancy, with a heavy penalty for any job already outside its
        permit conditions — simple enough to defend to an auditor in one sentence.
      </p>
    </MaximizablePanel>
  );
}
