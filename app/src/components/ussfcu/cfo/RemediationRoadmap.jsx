import { motion } from 'framer-motion';
import { GitBranch, Scale, KeyRound, Flag } from 'lucide-react';

const tracks = [
  {
    id: 'lineage',
    name: 'Lineage',
    icon: GitBranch,
    detail: 'Instrument the 4 transformation points between the Jack Henry core and Tableau so every reported figure is traceable to source.',
    delta: '5300 traceability → 100%',
    span: [0, 3],
  },
  {
    id: 'parity',
    name: 'Parity',
    icon: Scale,
    detail: 'One governed reconciliation between the GL, the Thought Machine ledger, and Lending origination, refreshed on a single schedule.',
    delta: 'Recon hours −77%',
    span: [1, 4],
  },
  {
    id: 'access',
    name: 'Access',
    icon: KeyRound,
    detail: 'Route the right governed data to the right role so the CFO, Lending, and auditors read the same figure.',
    delta: 'Audit cycle −61%',
    span: [2, 5],
  },
];

// Timeline columns: Jul (budget marker) → Q4 leadership / project window
const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RemediationRoadmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-surface-2 rounded-xl p-4 border border-border-subtle"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted">Data-Governance Remediation Roadmap</p>
        <span className="text-[10px] font-semibold text-brand bg-brand/5 border border-brand/15 px-1.5 py-0.5 rounded">
          For Sept 18–19 leadership event
        </span>
      </div>

      {/* Month header with July budget marker */}
      <div className="grid grid-cols-6 gap-1 mb-2 pl-[92px]">
        {months.map((m, i) => (
          <div key={m} className="text-center">
            <span className={`text-[9px] font-semibold ${i === 0 ? 'text-amber-600' : 'text-text-subtle'}`}>{m}</span>
            {i === 0 ? (
              <div className="flex items-center justify-center gap-0.5 mt-0.5">
                <Flag className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[7.5px] font-bold text-amber-600 uppercase">Budget</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Track rows */}
      <div className="space-y-2">
        {tracks.map((t) => {
          const Icon = t.icon;
          const startPct = (t.span[0] / months.length) * 100;
          const widthPct = ((t.span[1] - t.span[0]) / months.length) * 100;
          return (
            <div key={t.id} className="flex items-center gap-2">
              <div className="w-[84px] flex items-center gap-1.5 flex-shrink-0">
                <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-brand" />
                </div>
                <span className="text-[11px] font-bold text-text">{t.name}</span>
              </div>
              <div className="flex-1 relative h-7">
                <div className="absolute inset-0 rounded-md bg-surface-2" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{ left: `${startPct}%` }}
                  className="absolute top-0 h-7 rounded-md bg-gradient-to-r from-brand to-[#0052cc] flex items-center px-2"
                >
                  <span className="text-[9px] font-semibold text-white truncate">{t.delta}</span>
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Track detail */}
      <div className="mt-3 space-y-1">
        {tracks.map((t) => (
          <p key={t.id} className="text-[10px] text-text-muted leading-snug">
            <span className="font-semibold text-text-muted">{t.name}:</span> {t.detail}
          </p>
        ))}
      </div>
    </motion.div>
  );
}
