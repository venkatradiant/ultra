/**
 * PatternDetailPanel — the pattern drill-in, rendered inline in the conversation.
 *
 * Composes the panels §10A steps 3–6 call for and loads its own data, so the
 * persona manifest can attach it to a flow key without threading props through
 * the chat engine.
 *
 * `patternId` matters: the turn that opens Duplicate Device Installments must
 * show *that* pattern's 34 rows, not the hero's 87. Defaulting to the hero is
 * convenient for the steps that are genuinely about it, but the default is the
 * exception here, not the rule.
 *
 * `mode` selects which face of the same pattern the turn needs:
 *   'detail'  — the full drill-in (§10A step 3)
 *   'trust'   — reconciliation + confidence distribution (step 4)
 *   'lowConf' — only the rows below the auto-resolve threshold
 *   'impact'  — the projection against the SLA clock (step 5)
 */
import { useMemo } from 'react';
import useAsyncData from '../../hooks/useAsyncData';
import { getPatterns, getImpactedAccounts, getSla } from '../../data/att/billing-operator';
import { THRESHOLD_DEFAULTS } from '../../data/att/_shared/constants';
import RootCauseCallout from './RootCauseCallout';
import ProjectedImpactPanel from './ProjectedImpactPanel';
import ImpactedAccountsTable from './ImpactedAccountsTable';
import ReconciliationPanel from './ReconciliationPanel';
import SlaCountdown from './SlaCountdown';

/**
 * @param {object} props
 * @param {string} [props.patternId] Defaults to the hero pattern.
 * @param {'detail'|'trust'|'lowConf'|'impact'} [props.mode]
 */
export default function PatternDetailPanel({ patternId, mode = 'detail' }) {
  const patterns = useAsyncData(getPatterns);
  const byPattern = useAsyncData(getImpactedAccounts);
  const sla = useAsyncData(getSla);

  const pattern = useMemo(() => {
    if (!patterns) return null;
    if (patternId) return patterns.find((p) => p.id === patternId) || null;
    return patterns.find((p) => p.hero) || patterns[0];
  }, [patterns, patternId]);

  const rows = useMemo(
    () => (pattern && byPattern ? byPattern[pattern.id] || [] : []),
    [pattern, byPattern],
  );
  const lowRows = useMemo(
    () => rows.filter((r) => r.confidence < THRESHOLD_DEFAULTS.high),
    [rows],
  );

  if (!pattern || !rows.length) return null;

  // §10A step 5 — the projection is only half the answer; it is the projection
  // *against the clock* that turns "should I?" into arithmetic.
  if (mode === 'impact') {
    return (
      <div className="space-y-4">
        <ProjectedImpactPanel pattern={pattern} sla={sla} />
        <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5">
          <SlaCountdown sla={sla} />
        </div>
      </div>
    );
  }

  if (mode === 'lowConf') {
    return <ImpactedAccountsTable rows={lowRows} maxHeight="max-h-[340px]" />;
  }

  if (mode === 'trust') {
    return (
      <div className="space-y-4">
        <ReconciliationPanel pattern={pattern} rows={rows} />
        <ImpactedAccountsTable rows={rows} maxHeight="max-h-[340px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RootCauseCallout pattern={pattern} />
        <ProjectedImpactPanel pattern={pattern} sla={sla} />
      </div>
      <ImpactedAccountsTable rows={rows} maxHeight="max-h-[400px]" />
    </div>
  );
}
