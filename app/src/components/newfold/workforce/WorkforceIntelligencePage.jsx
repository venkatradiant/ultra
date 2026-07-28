import { motion } from 'framer-motion';
import { Users2, Gauge, Server, Target } from 'lucide-react';
import MultiYearSurgeChart from './MultiYearSurgeChart';
import StaffingScenarioTable from './StaffingScenarioTable';
import CohortRampCurve from './CohortRampCurve';
import page from '../../../data/newfold-digital/workforce/pageData.json';

const ftlColor = (v) => (v >= 1.0 ? 'text-emerald-600' : v >= 0.9 ? 'text-amber-600' : 'text-red-600');
const covStyle = (c) => (c === 'Adequate' ? 'text-emerald-600 bg-emerald-500/10' : 'text-red-600 bg-red-500/10');

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-brand" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-text leading-tight">{title}</h2>
          <p className="text-[11px] text-text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function WorkforceIntelligencePage() {
  const b = page.bpoCapacity;
  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 space-y-6">
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center gap-2">
            <Users2 className="w-4 h-4 text-brand" />
            <h1 className="text-lg font-bold text-text">Workforce Intelligence</h1>
          </div>
          <p className="text-[12px] text-text-muted mt-0.5">
            Force-to-load by queue and brand, shift coverage, forecast accuracy, and the seasonal renewal-and-holiday overlay — across every care queue and brand.
          </p>
        </motion.div>

        {/* Force-to-load by queue & brand */}
        <Section icon={Gauge} title="Force-to-Load by Queue & Brand" subtitle="Staffed-to-demand ratio · target 1.0 · the surge plan weights the sub-1.0 queues first">
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-2">
                  <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Queue</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Brand</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Force-to-Load</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-text-muted text-[10px] uppercase tracking-wider">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {page.forceToLoad.map((r) => (
                  <tr key={r.queue} className="border-t border-border-subtle hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-text">{r.queue}</td>
                    <td className="px-3 py-3 text-text-muted">{r.brand}</td>
                    <td className={`px-3 py-3 text-center font-bold text-sm tabular-nums ${ftlColor(r.ftl)}`}>{r.ftl.toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold rounded px-1.5 py-0.5 ${covStyle(r.coverage)}`}>{r.coverage}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Shift coverage */}
          <div className="bg-surface rounded-xl border border-border p-4">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Shift Coverage vs Required — Q4 Peak</p>
            <div className="space-y-2.5">
              {page.shiftCoverage.map((s) => {
                const pct = Math.round((s.scheduled / s.required) * 100);
                return (
                  <div key={s.shift} className="flex items-center gap-3">
                    <span className="text-[11px] text-text w-32 flex-shrink-0">{s.shift}</span>
                    <div className="flex-1 bg-surface-2 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 98 ? 'bg-emerald-400' : pct >= 90 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-text-muted tabular-nums w-24 text-right">{s.scheduled}/{s.required}{s.gap > 0 ? ` · −${s.gap}` : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Seasonal overlay + scenarios */}
        <Section icon={Target} title="Seasonal Overlay & Staffing Scenarios" subtitle="3-year Q4 volume overlay against capacity, and the scenarios that close the gap">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <MultiYearSurgeChart />
            <StaffingScenarioTable />
          </div>
        </Section>

        {/* BPO capacity + cohort */}
        <Section icon={Server} title="BPO Overflow Readiness & New-Hire Ramp" subtitle="Overflow capacity for the peak window and the cohort that isn't ready yet">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-text-muted mb-3">BPO Overflow Capacity — Dec 8–15</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border-subtle p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600 tabular-nums">{b.available}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Available</p>
                </div>
                <div className="rounded-lg border border-border-subtle p-3 text-center">
                  <p className="text-2xl font-bold text-brand tabular-nums">{b.needed}</p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Needed</p>
                </div>
              </div>
              <p className="text-[11px] text-text-muted mt-3">{b.certified}-certified agents · confirm by <span className="font-semibold text-text">{b.confirmBy}</span> · {b.contingency} held as contingency.</p>
            </div>
            <CohortRampCurve />
          </div>
        </Section>
      </div>
    </div>
  );
}
