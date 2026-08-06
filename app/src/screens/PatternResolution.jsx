/**
 * Pattern resolution — the pattern list, and one pattern's detail.
 *
 * One route, two states, selected by `?pattern=PATTERN-001`. The query param
 * rather than `/patterns/:id` follows the `?c=` precedent already in the
 * Platform Admin observability screen and keeps this from becoming the app's
 * first parameterised route.
 */
import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePersona } from '../context/PersonaContext';
import useAsyncData from '../hooks/useAsyncData';
import { getPatterns, getImpactedAccounts, getCycle, getSla } from '../data/att/billing-operator';
import WorkbenchPageHeader from '../components/att/WorkbenchPageHeader';
import PatternCardGrid from '../components/att/PatternCardGrid';
import RootCauseCallout from '../components/att/RootCauseCallout';
import ProjectedImpactPanel from '../components/att/ProjectedImpactPanel';
import ImpactedAccountsTable from '../components/att/ImpactedAccountsTable';
import ActionBar from '../components/att/ActionBar';

export default function PatternResolution() {
  const persona = usePersona();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const patterns = useAsyncData(getPatterns);
  const accountsByPattern = useAsyncData(getImpactedAccounts);
  const cycle = useAsyncData(getCycle);
  const sla = useAsyncData(getSla);
  const [selection, setSelection] = useState(null);

  const patternId = params.get('pattern');
  const pattern = patterns?.find((p) => p.id === patternId) || null;
  const rows = useMemo(
    () => (patternId && accountsByPattern ? accountsByPattern[patternId] || [] : []),
    [patternId, accountsByPattern],
  );

  const selectedRows = selection ? rows.filter((r) => selection.has(r.id)) : rows;
  const selectedTotal = selectedRows.reduce(
    (s, r) => s + Math.abs(r.correctedAmount - r.currentAmount),
    0,
  );

  if (persona?.id !== 'att_billing_operator') {
    return (
      <div className="flex-1 py-8 px-6 lg:px-8 overflow-y-auto">
        <p className="text-sm text-text-muted">This view is not available for the active persona.</p>
      </div>
    );
  }

  if (!patterns) return <div className="flex-1 bg-bg" />;

  // ─── Detail ──────────────────────────────────────────────────
  if (pattern) {
    return (
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
        <button
          type="button"
          onClick={() => { setSelection(null); setParams({}); }}
          className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-text-muted hover:text-text mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All patterns
        </button>

        <WorkbenchPageHeader
          title={pattern.name}
          subtitle={pattern.action}
          cycle={cycle}
          asOf="3 minutes ago"
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <RootCauseCallout pattern={pattern} />
          <ProjectedImpactPanel pattern={pattern} sla={sla} />
        </div>

        <div className="mb-4">
          <ImpactedAccountsTable
            rows={rows}
            selectedIds={selection}
            onSelectionChange={setSelection}
            maxHeight="max-h-[560px]"
          />
        </div>

        <ActionBar
          pattern={pattern}
          selectedCount={selectedRows.length}
          selectedTotal={selectedTotal}
          isPartial={!!selection}
          onApply={() => navigate('/history')}
        />
      </div>
    );
  }

  // ─── List ────────────────────────────────────────────────────
  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-y-auto scrollbar-sleek">
      <WorkbenchPageHeader
        title="Anomaly Patterns"
        subtitle="All 207 anomalies in this cycle, grouped by shared root cause. Five groups are bulk-resolvable in one reviewed action each; the sixth is the residue that fits no pattern and needs individual investigation."
        cycle={cycle}
        asOf="3 minutes ago"
      />
      <PatternCardGrid onSelect={(id) => setParams({ pattern: id })} />
    </div>
  );
}
