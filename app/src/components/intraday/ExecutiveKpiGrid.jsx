import { useMemo } from 'react';
import KpiTile from './KpiTile';

function mergeKpi(kpi, overrides) {
  if (!overrides || !(kpi.id in overrides)) return kpi;
  return { ...kpi, value: overrides[kpi.id] };
}

export default function ExecutiveKpiGrid({ baseline, snapshot }) {
  const kpis = useMemo(() => {
    const base = baseline?.tiers?.executive?.kpis || [];
    const overrides = snapshot?.kpiOverrides || {};
    return base.map((k) => mergeKpi(k, overrides));
  }, [baseline, snapshot]);

  if (!kpis.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-2 p-4 text-[11px] text-text-muted">
        Executive tier KPIs not configured for this persona.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {kpis.map((k) => (
        <KpiTile key={k.id} kpi={k} />
      ))}
    </div>
  );
}
