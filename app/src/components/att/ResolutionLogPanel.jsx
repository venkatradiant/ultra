/**
 * ResolutionLogPanel — the audit rows the action just wrote.
 *
 * Shown inline the moment a bulk fix lands, because that adjacency is the
 * point: the audit trail is not somewhere else and not produced later, it is
 * the immediate consequence of the click.
 *
 *   `success`     — §10A step 6's "success state on the pattern", above the rows.
 *   `withSummary` — §10A step 7's session tiles, where the question shifts from
 *                   "what did I just do?" to "what did I do today?".
 *   `withExport`  — step 7's Export Audit Report action. Staged, not generated:
 *                   producing a file would claim a governance integration this
 *                   prototype does not have.
 *   `filterStatus`— narrow to one outcome (the escalated-items turn).
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import useAsyncData from '../../hooks/useAsyncData';
import { getResolutionHistory, getCycle } from '../../data/att/billing-operator';
import AuditTable from './AuditTable';
import ResolutionSummaryTiles from './ResolutionSummaryTiles';

function SuccessState({ success }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border border-emerald-300 bg-emerald-500/[0.07] p-4 sm:p-5"
    >
      <p className="inline-flex items-center gap-2 text-[13px] font-bold text-emerald-800">
        <CheckCircle2 className="w-4.5 h-4.5" /> {success.title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {success.stats.map((s) => (
          <div key={s.label} className="min-w-0">
            <p className="text-lg font-bold text-emerald-900 leading-none tabular-nums">{s.value}</p>
            <p className="text-[10px] text-emerald-800/75 mt-1 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10.5px] text-emerald-800/70 mt-3">
        Illustrative — no request left this demo.
      </p>
    </motion.div>
  );
}

/**
 * @param {object} props
 * @param {{title: string, stats: Array<{value: string, label: string}>}} [props.success]
 * @param {boolean} [props.withSummary]
 * @param {boolean} [props.withExport]
 * @param {string} [props.filterStatus]
 */
export default function ResolutionLogPanel({
  success,
  withSummary = false,
  withExport = false,
  filterStatus,
}) {
  const history = useAsyncData(getResolutionHistory);
  const cycle = useAsyncData(getCycle);
  const [exported, setExported] = useState(false);

  const records = useMemo(() => {
    if (!history) return [];
    return filterStatus ? history.records.filter((r) => r.status === filterStatus) : history.records;
  }, [history, filterStatus]);

  if (!history) return null;

  return (
    <div className="space-y-4">
      {success && <SuccessState success={success} />}
      {withSummary && <ResolutionSummaryTiles summary={history.summary} />}

      {exported && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-500/[0.07] p-3.5">
          <p className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> Audit report staged
          </p>
          <p className="text-[11.5px] text-text-muted mt-1.5 leading-relaxed">
            Cycle {cycle?.id} · {cycle?.instance} — {history.summary.totalResolutions} resolution rows with
            rebill IDs, confidence tiers, operator IDs and timestamps, ready for governance. Staged in this
            demo rather than generated; no file was produced and nothing left the browser.
          </p>
        </div>
      )}

      <AuditTable records={records} onExport={withExport ? () => setExported(true) : null} />
    </div>
  );
}
