/**
 * Resolution History — the audit trail for cycle 2026-02.
 *
 * The export is staged rather than generated: this is a demo, and producing a
 * file would make a claim about governance tooling that the prototype does not
 * back. What it does show is the thing that matters — the log exists because it
 * was written as the operator acted, not assembled afterwards.
 */
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getResolutionHistory, getCycle } from '../data/att/billing-operator';
import WorkbenchPageHeader from '../components/att/WorkbenchPageHeader';
import ResolutionSummaryTiles from '../components/att/ResolutionSummaryTiles';
import AuditTable from '../components/att/AuditTable';

export default function ResolutionHistory() {
  const persona = usePersona();
  const history = useAsyncData(getResolutionHistory);
  const cycle = useAsyncData(getCycle);
  const [exported, setExported] = useState(false);

  if (persona?.id !== 'att_billing_operator') {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!history) return <div className="flex-1 bg-bg" />;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <WorkbenchPageHeader
        title="Resolution History"
        subtitle="Every action taken this session, with the rebill ID, confidence tier, before and after amounts, operator and timestamp. Written at the moment of the action — this is the record, not a report about it."
        cycle={cycle}
        asOf="2 minutes ago"
      />

      <div className="mb-4">
        <ResolutionSummaryTiles summary={history.summary} />
      </div>

      {exported && (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-500/[0.07] p-3.5">
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

      <AuditTable records={history.records} onExport={() => setExported(true)} />
    </div>
  );
}
