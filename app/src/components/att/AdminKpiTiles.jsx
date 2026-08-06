/**
 * AdminKpiTiles — the four platform-level readings above the console.
 *
 * Uptime, average confidence, active operators and model version. The last one
 * is not a metric and is shown anyway: every other number on this page is
 * produced by a specific model build, and an admin reading accuracy without
 * knowing which version produced it is reading a number with no referent.
 */
import { motion } from 'framer-motion';
import { Activity, Target, Users, Database } from 'lucide-react';
import IllustrativeChip from './IllustrativeChip';

const ICONS = { activity: Activity, target: Target, users: Users, database: Database };

export default function AdminKpiTiles({ kpis = [] }) {
  if (!kpis.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {kpis.map((k, i) => {
        const Icon = ICONS[k.icon] || Activity;
        return (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            className="rounded-2xl border border-border-subtle bg-surface p-4 min-w-0"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[11px] font-medium text-text-muted truncate">{k.label}</span>
              <Icon className="w-4 h-4 text-brand flex-shrink-0" />
            </div>
            <p className="text-2xl font-bold text-text leading-none tracking-tight tabular-nums">{k.value}</p>
            <p className="text-[10.5px] text-text-muted mt-1.5 leading-snug">{k.sub}</p>
            <p className="text-[9.5px] text-text-subtle mt-2 leading-snug">
              <span className="font-medium text-text-muted">Source:</span> {k.source}
              {k.target && <> · <span className="font-medium text-text-muted">Target:</span> {k.target}</>}
            </p>
          </motion.div>
        );
      })}
      <div className="sm:col-span-2 xl:col-span-4 flex justify-end">
        <IllustrativeChip />
      </div>
    </div>
  );
}
